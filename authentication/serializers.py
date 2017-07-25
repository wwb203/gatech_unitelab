from django.contrib.auth import update_session_auth_hash
from rest_framework import serializers
from authentication.models import Account
from django.core.exceptions import ObjectDoesNotExist

class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Account
        fields = ('id', 'email', 'username','create_at','update_at',
                'first_name', 'last_name', 'password',
                'confirm_password','userType','tagline','boss_email')
        read_only_fields = ('create_at', 'update_at',)


    def create(self, validated_data):
        print("AccountSerializer create")
        return Account.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        try:
            lab_queryset = Account.objects.get(email=validated_data.get('boss_email',instance.boss_email)).lab
            instance.boss_email = validated_data.get('boss_email',instance.boss_email);
            instance.lab = lab_queryset
            instance.lab_pending = True
        except ObjectDoesNotExist:
            pass
        instance.save()
        password = validated_data.get('password', None)
        confirm_password = validated_data.get('confirm_password', None)

        if password and confirm_password and password == confirm_password:
            instance.set_password(password)
            instance.save()
            update_session_auth_hash(self.context.get('request'), instance)

        return instance
