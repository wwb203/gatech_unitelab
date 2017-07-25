from django.shortcuts import render
from rest_framework.parsers import JSONParser
from rest_framework import viewsets, permissions,status, views
from authentication.models import Account
from authentication.permissions import IsAccountOwner
from authentication.serializers import AccountSerializer
import json
from django.contrib.auth import authenticate, login,logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from django.utils.decorators import method_decorator

# Create your views here.


class AccountViewSet(viewsets.ModelViewSet):
    lookup_field = 'username'
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return (permissions.AllowAny(),)
        
        if self.request.method == 'POST':
            return (permissions.AllowAny(),)
    
        return (permissions.IsAuthenticated(), IsAccountOwner(),)

    def create(self, request):
        serializer = AccountSerializer(data=request.data)
        if serializer.is_valid():
            print("is valid")
            Account.objects.create_user(**serializer.validated_data)
            return Response(serializer.validated_data, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'Bad request',
            'message': 'Account could not be created with received data.'
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)

        email = data.get('email', None)
        password = data.get('password')

        account = authenticate(email=email, password=password)

        if account is not None:
            if account.is_active:
                login(request, account)
                serialized = AccountSerializer(account)
                return Response(serialized.data)
            else:
                return Response({
                    'status': 'Unauthorzied',
                    'message': 'This account has been disabled.'
                    })
        else:
            return Response(
                    {'status': 'Unaunthorized',
                     'message': 'Username/password combination invalid.'}, 
                    status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(views.APIView):
    permissions = (permissions.IsAuthenticated,)
    def post(self, request, format=None):
        logout(request)
        return Response({}, status=status.HTTP_204_NO_CONTENT)
