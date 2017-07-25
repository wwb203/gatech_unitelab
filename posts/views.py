from rest_framework import permissions, viewsets
from rest_framework.response import Response
from posts.models import Post
from posts.permissions import IsAuthorOfPost
from posts.serializers import PostSerializer
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from django.http import JsonResponse
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from authentication.models import Account
from posts.models import Lab, EquipType, Event, Equip
import json
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from datetime import *
import pytz


# Create your views here.
# @csrf_exempt


@api_view(['GET', 'POST'])
@authentication_classes((SessionAuthentication, BasicAuthentication, TokenAuthentication,))
@permission_classes((IsAuthenticated,))
def equipmentlist(request):
    if request.method == 'GET':
        print('equipmentlist')
        spec = {'name': 'Eppendorf 5810R',
                'content': 'Centrifuge 5810R is a workhorse for medium to high-throughput laboratories. It combines extraordinary versatility and cap    acity for both tubes and plates with an extraordinary compact footprint.',
                'image_url': 'https://online-shop.eppendorf.com/upload/main/products/export-SCREEN-JPG-max1200pxW-96    dpi-RGB/std.lang.all/155462.jpg'};
        return JsonResponse(spec)
    else:
        pass


@api_view(['GET', 'POST'])
def searchEquipment(request):
    print('searchEquipment')
    print(request.data)
    print(request.user.username)
    if request.method == 'POST':
        return Response("hello")
    else:
        pass


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.order_by('-create_at')
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return (permissions.AllowAny(),)
        return (permissions.IsAuthenticated(), IsAuthorOfPost(),)

    def perform_create(self, serializer):
        print('perform_create')
        instance = serializer.save(author=self.request.user)
        print('get instance')
        return super(PostViewSet, self).perform_create(serializer)


class AccountPostsViewSet(viewsets.ViewSet):
    queryset = Post.objects.select_related('author').order_by('-create_at')
    serializer_class = PostSerializer

    def list(self, request, account_username=None):
        queryset = self.queryset.filter(author__username=account_username)
        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data)

###################################################################
# API-2
@csrf_exempt
@api_view(['GET'])
def AccountInfo(request):
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    json_template = {}
    json_template["id"] = request.user.id
    json_template['email'] = request.user.email
    json_template['username'] = request.user.username
    json_template['firstName'] = request.user.first_name
    json_template['lastName'] = request.user.last_name
    json_template['userTypeID'] = request.user.userType
    json_template['userType'] = request.user.get_userType_display()
    json_template['boss_email'] = request.user.boss_email
    if request.user.lab != None:
        json_template['lab'] = request.user.lab.id
        json_template['labName'] = request.user.lab.name
    json_template['lab_pending'] = request.user.lab_pending
    return JsonResponse({"status": "Success", "data": json_template})

# API-3d1
@csrf_exempt
def LabApplicantList(request):
    # requirement: request.user has logged in and is a boss with a valid lab
    # Method: Get
    if request.method != 'GET':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if request.user.userType != "1":
        return JsonResponse({"status": "Error", "message": "The user is not a Boss. Please retry."})
    if not request.user.lab:
        return JsonResponse({"status": "Error", "message": "The boss doesn't have a lab. Please connect admin."})
    applicant_queryset = Account.objects.filter(lab_pending=True, lab=request.user.lab, userType='2')
    applicant_list = []
    for applicant in applicant_queryset:
        json_template = {}
        json_template["id"] = applicant.id
        json_template['email'] = applicant.email
        json_template['username'] = applicant.username
        json_template['firstName'] = applicant.first_name
        json_template['lastName'] = applicant.last_name
        json_template['userTypeID'] = applicant.userType
        json_template['userType'] = applicant.get_userType_display()
        json_template['lab'] = applicant.lab.id
        json_template['labName'] = applicant.lab.name
        json_template['lab_pending'] = applicant.lab_pending
        applicant_list.append(json_template)
    return JsonResponse({"status": "Success", "studentList": applicant_list})

# API-3d2
@csrf_exempt
def LabDealApplicantID(request):
    # input {"id":"<student_id>","approve":"<approve_Boolean>"}
    # requirement: request.user has logged in and is a boss with a valid lab
    # Method: Post
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if request.user.userType != "1":
        return JsonResponse({"status": "Error", "message": "The user is not a Boss. Please retry."})
    if not request.user.lab:
        return JsonResponse({"status": "Error", "message": "The boss doesn't have a lab. Please connect admin."})
    data = json.loads(request.body)

    if 'id' not in data:
        return JsonResponse({"status": "Error", "message": "No student id input.Please retry."})
    if 'approve' not in data:
        return JsonResponse({"status": "Error", "message": "No approve status input.Please retry."})

    student_queryset = Account.objects.filter(id=data['id'])
    try:
        student = student_queryset.get(id=data['id'])
    except ObjectDoesNotExist:
        return JsonResponse({"status": "Error", "message": "Certain applicant id does not exist.Please retry."})

    if student.userType != "2":
        return JsonResponse({"status": "Error", "message": "The input user is not a student.Please retry."})
    if student.lab != request.user.lab:
        return JsonResponse({"status": "Error", "message": "The input student is not a valid applicant.Please retry."})
    if student.lab_pending == False:
        return JsonResponse(
            {"status": "Error", "message": "The input student has already been a member of your lab.Please retry."})

    approveStr = data['approve'].lower()
    if approveStr == 'true':
        student.lab_pending = False
        student.has_access = True
        student.save()
        return JsonResponse({"status": "Success", "message": "successfully added."})

    elif approveStr == 'false':
        student.lab_pending = True
        student.lab = None
        student.save()
        return JsonResponse({"status": "Success", "message": "successfully rejected."})
    else:
        return JsonResponse({"status": "Error", "message": "The input approve status is not valid.Please retry."})

########################################################
# API-4a
@csrf_exempt
@api_view(['GET'])
def EquipTypeList(request):
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    EquipType_queryset = EquipType.objects.all()
    EquipType_list = []
    for equiptype in EquipType_queryset:
        EquipType_list.append(equiptype.toJSON3_disable_related())
    return JsonResponse({"status": "Success", "Library": EquipType_list})

# API-5a spec finished
@csrf_exempt
def AuthList(request):
    if request.method != 'GET':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if request.user.userType != "1":
        return JsonResponse({"status": "Error", "message": "The user is not a Boss. Please retry."})
    if not request.user.lab:
        return JsonResponse({"status": "Error", "message": "The boss doesn't have a lab. Please connect admin."})

    student_queryset = Account.objects.filter(userType="2", lab=request.user.lab)
    student_list = []
    for student in student_queryset:
        json_template = {}
        json_template["id"] = student.id
        json_template['email'] = student.email
        json_template['username'] = student.username
        json_template['firstName'] = student.first_name
        json_template['lastName'] = student.last_name
        json_template['userTypeID'] = student.userType
        json_template['userType'] = student.get_userType_display()
        if student.lab != None:
            json_template['lab'] = student.lab.id
            json_template['labName'] = student.lab.name
        json_template['lab_pending'] = student.lab_pending
        student_list.append(json_template)

    equip_queryset = Equip.objects.filter(lab=request.user.lab)
    equip_list = []
    for equip in equip_queryset:
        json_template = equip.toJSON3()
        equipAuth_template = []
        equipAuth_queryset = equip.equip_auth.all()
        for equipmember in equipAuth_queryset:
            equipAuth_template.append(equipmember.id)
        json_template['equipAuth'] = equipAuth_template
        equip_list.append(json_template)

    return JsonResponse({"status": "Success", "studentList": student_list, "equipList": equip_list})

# API-5b
@csrf_exempt
def AuthUpdate(request):
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if request.user.userType != "1":
        return JsonResponse({"status": "Error", "message": "The user is not a Boss. Please retry."})
    if not request.user.lab:
        return JsonResponse({"status": "Error", "message": "The boss doesn't have a lab. Please connect admin."})

    equip_queryset = Equip.objects.filter(lab=request.user.lab)
    data = json.loads(request.body)
    if 'equipList' not in data:
        return JsonResponse({"status": "Error", "message": "No equipList input.Please retry."})

    ErrorEquip = ''
    SuccessEquip = ''

    equip_queryset = Equip.objects.filter(lab=request.user.lab)
    student_queryset = Account.objects.filter(userType="2", lab=request.user.lab)
    for equip in data['equipList']:
        try:
            equip_updated = equip_queryset.get(id=equip['id'])
            for studentid in equip['equipAuth']:
                student_queryset.get(id=studentid)
        except (ObjectDoesNotExist, KeyError):
            ErrorEquip = ErrorEquip + str(equip['id']) + ', '
            continue
        equip_updated.equip_auth.clear()
        for studentid in equip['equipAuth']:
            student_added = student_queryset.get(id=studentid)
            equip_updated.equip_auth.add(student_added)
        SuccessEquip = SuccessEquip + str(equip['id']) + ', '

    return JsonResponse({"status": "Success", "SuccessEquip": SuccessEquip, "ErrorEquip": ErrorEquip})


# API-6b/8a GET- myevent
@csrf_exempt
def Eventlist(request, equipid=None):
    if request.method != 'GET':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if request.user.lab_pending:
        return JsonResponse({"status": "Error", "message": "request with lab pending user, please contact your lab manager."})

    permission=''
    if equipid != None:
        try:
            Equip_queryset = Equip.objects.get(id = equipid)
            try:
                request.user.equip_auth.get(id = equipid)
                permission = 'manage'
            except ObjectDoesNotExist:
                if Equip_queryset.lab != request.user.lab:
                    permission = 'rent'
                elif request.user.userType == '1':
                    permission = 'manage'
                else:
                    permission = 'use'
        except ObjectDoesNotExist:
            return JsonResponse({"status": "Error", "message": "Certain equip not found."})

    event_queryset = Event.objects.filter(Q(manager=request.user) |
                                          Q(user=request.user) |
                                          Q(equip__id=equipid))
    Errorevent = []
    eventList = []

    for event in event_queryset:
        # try:
        #     json_template = {}
        #     json_template['title'] = event.title
        #     json_template['id'] = event.id
        #     json_template['start_time'] = EventDateHelper(event.start_time)
        #     json_template['end_time'] = EventDateHelper(event.end_time)
        #     json_template['finish'] = event.finish
        #     json_template['eventTypeID'] = event.eventType
        #     json_template['eventType'] = event.get_eventType_display()
        #     json_template['type'] = event.get_eventType_display()
        #     json_template['location'] = event.equip.location
        #     json_template['equipID'] = event.equip.id
        #     json_template['managerID'] = event.manager.id
        #     json_template['userID'] = event.user.id
        #     json_template['equip'] = event.equip.__unicode__()
        #     json_template['user'] = event.user.username
        #     json_template['manager'] = event.manager.username
        #     json_template['user_rate'] = event.user_rate
        #     json_template['user_note'] = event.user_note
        #     json_template['manager_rate'] = event.manager_rate
        #     json_template['manager_note'] = event.manager_note
        #     json_template['equip_rate'] = event.equip_rate
        #     json_template['disable'] = event.disable
        # except KeyError:
        #     Errorevent = Errorevent + str(event['id']) + ', '
        #     continue
        try:
            eventList.append(event.toJson())
        except KeyError:
            Errorevent = Errorevent + str(event['id']) + ', '
            continue
    return JsonResponse({"status": "Success", "permission":permission, "ErrorEvent": Errorevent, "Eventlist": eventList})

# API-POST Reserve
@csrf_exempt
def PostReserveEvent(request):
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    data = json.loads(request.body)
    new_event = Event()
    try:
        equip_used = Equip.objects.get(id = data['equip'])
        equip_start_time = datetime.strftime(data["start_time"],'%Y-%M-%D %H:%M:%S')
        equip_end_time = datetime.strftime(data["end_time"], '%Y-%M-%D %H:%M:%S')
        share_event = Event.objects.get(id=data['sareeventid'], equip = equip_used,
                                        eventType = '1')
    except ObjectDoesNotExist:
        return JsonResponse({"status":"Error","message":"certain event or equip not found."})
    except KeyError:
        return JsonResponse({"status":"Error","message":"Not enough input arguments."})
    except ValueError:
        return JsonResponse({"status":"Error","message":"Datetime format Error.YYYY-MM-DD HH:MM:SS"})

    if equip_start_time >= equip_end_time:
        return JsonResponse({"status": "Error", "message": "start time is not earlier than end time"})
    if equip_start_time < share_event.start_time or equip_end_time > share_event.end_time:
        return JsonResponse({"status": "Error", "message": "Reserve Event is not in share event."})

    new_event.user = request.user
    new_event.title = data.get('title','')
    new_event.start_time = equip_start_time
    new_event.end_time = equip_end_time
    new_event.eventType = '2'
    new_event.equip = equip_used
    new_event.manager = share_event.manager

    new_event.save()
    share_event.save()

    return JsonResponse({"status":"Success","message":"Successfully added reserve event."})

# API-POST Event not protected
@csrf_exempt
def PostEvent_NotProtected(request):
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    data_out = json.loads(request.body)

    try:
        request_method = data_out['method'].lower()
    except KeyError:
        return JsonResponse({"status":"Error","message":"No Method(new/change) input."})
    try:
        data = data_out['event']
    except KeyError:
        return JsonResponse({"status":"Error","message":"No event data input."})

    if request_method == "new":
        new_event = Event()
        try:
            event_title = data.get('title','')
            event_type = data['eventType'].lower()
            event_user = Account.objects.get(username = data.get('user',request.user.username))
            event_start_time = datetime.strptime(data["start_time"], '%Y-%m-%d %H:%M:%S')
            event_end_time = datetime.strptime(data["end_time"], '%Y-%m-%d %H:%M:%S')
            event_manager = Account.objects.get(username = data['manager'])
            event_equip_used = Equip.objects.get(id = data['equipID'])
            event_disable_str = data.get('disable','false').lower()
        except ObjectDoesNotExist:
            return JsonResponse({"status": "Error", "message": "equip or user not found."})
        except KeyError:
            return JsonResponse({"status": "Error", "message": "Not enough input arguments."})
        except ValueError:
            return JsonResponse({"status": "Error", "message": "Datetime format Error.YYYY-MM-DD HH:MM:SS"})
        if event_start_time >= event_end_time:
            return JsonResponse({"status": "Error", "message": "start time is not earlier than end time"})
        if event_disable_str == 'true':
            event_disable = True
        elif event_disable_str == 'false':
            event_disable = False
        else:
            return JsonResponse({"status": "Error", "message": "Invalid boolean input"})

        if event_type == 'reserve':
            new_event.eventType = '2'
        elif event_type == 'share':
            new_event.eventType = '0'
        else:
            return JsonResponse({"status": "Error", "message": "eventType not valid (share/reserve)."})
        new_event.title = event_title
        new_event.start_time = event_start_time
        new_event.end_time = event_end_time
        new_event.equip = event_equip_used
        new_event.manager = event_manager
        new_event.user = event_user
        new_event.disable = event_disable
        new_event.save()
        return JsonResponse({"status":"Success","message":"Successfully added new event.","event":new_event.toJson()})
    elif request_method == "change":
        try:
            changed_event = Event.objects.get(id = data['eventID'])
        except KeyError:
            return JsonResponse({"status": "Error", "message": "No eventID input."})
        except ObjectDoesNotExist:
            return JsonResponse({"status": "Error", "message": "No certain event exist."})
        try:
            changed_event.title = data.get('title',changed_event.title)
            if "start_time" in data:
                changed_event.start_time = datetime.strptime(data["start_time"], '%Y-%m-%d %H:%M:%S')
                changed_event.start_time = changed_event.start_time.replace(tzinfo=pytz.utc)
            if "end_time" in data:
                changed_event.end_time = datetime.strptime(data["end_time"], '%Y-%m-%d %H:%M:%S')
                changed_event.end_time = changed_event.end_time.replace(tzinfo=pytz.utc)
            if "disable" in data:
                event_disable_str = data['disable'].lower()
                if event_disable_str == 'true':
                    changed_event.disable = True
                elif event_disable_str == 'false':
                    changed_event.disable = False
                else:
                    return JsonResponse({"status": "Error", "message": "Invalid boolean input"})
            if "equipID" in data:
                changed_event.equip = Equip.objects.get(id = data['equipID'])
            if "user" in data:
                changed_event.user = Account.objects.get(username = data['user'])
            if "manager" in data:
                changed_event.manager = Account.objects.get(username=data['manager'])
            if "eventType" in data:
                event_type = data['eventType'].lower()
                if event_type == 'reserve':
                    changed_event.eventType = '2'
                elif event_type == 'share':
                    changed_event.eventType = '0'
                else:
                    return JsonResponse({"status": "Error", "message": "eventType not valid (share/reserve)."})
        except ObjectDoesNotExist:
            return JsonResponse({"status": "Error", "message": "equip or user not found."})
        except ValueError:
            return JsonResponse({"status": "Error", "message": "Datetime format Error.YYYY-MM-DD HH:MM:SS"})
        if changed_event.start_time >= changed_event.end_time:
            return JsonResponse({"status": "Error", "message": "start time is not earlier than end time"})
        changed_event.save()

        return JsonResponse({"status":"Success","message":"Successfully updated event.","event":changed_event.toJson()})
    else:
        return JsonResponse({"status": "Error", "message": "Invalid method attribute. (new/change)"})

# API Get group equiplist
@csrf_exempt
def GroupEquipList(request):
    if request.method != 'GET':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if not request.user.lab:
        return JsonResponse({"status": "Error", "message": "The user doesn't have a lab. Please retry."})

    equip_queryset = Equip.objects.filter(lab=request.user.lab)

    equip_list = []
    for equip in equip_queryset:
        equip_list.append(equip.toJSON3())
    return JsonResponse({"status": "Success", "equipList": equip_list})

# API Search
@csrf_exempt
def EquipSearch(request):
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    data = json.loads(request.body)
    Message = ''
    if 'typeID' in data:
        try:
            equiptype_searched = EquipType.objects.get(id=data['typeID'])
        except ObjectDoesNotExist:
            return JsonResponse({"status": "Error", "message": "Certain equiptype not found."})
        except ValueError:
            return JsonResponse({"status": "Error", "message": "Invalid typeID input."})

        equip_queryset = Equip.objects.filter(equip_type=equiptype_searched)
        if 'paraList' in data:
            for spec in data['paraList']:
                disabled_str = spec.get('disabled', 'true').lower()
                if disabled_str == 'false' and (spec.get('specID', '0') in ['1', '2', '3']) and ('value' in spec):
                    if spec['specID'] == '1':
                        if equiptype_searched.parameter1_disable == False:
                            para_type = equiptype_searched.parameter1_type
                            if para_type == '0':  # numerical
                                try:
                                    para_value = int(spec['value'])
                                except:
                                    continue
                                equip_queryset = equip_queryset.filter(parameter1__lte=para_value,
                                                                       parameter1b__gte=para_value)
                            elif para_type == '1':  # enum
                                para_value = ',' + spec['value'] + ','
                                equip_queryset = equip_queryset.filter(parameter1__contains=para_value)
                    elif spec['specID'] == '2':
                        if equiptype_searched.parameter2_disable == False:
                            para_type = equiptype_searched.parameter2_type
                            if para_type == '0':  # numerical
                                try:
                                    para_value = int(spec['value'])
                                except:
                                    continue
                                equip_queryset = equip_queryset.filter(parameter2__lte=para_value,
                                                                       parameter2b__gte=para_value)
                            elif para_type == '1':  # enum
                                para_value = ',' + spec['value'] + ','
                                equip_queryset = equip_queryset.filter(parameter2__contains=para_value)
                    elif spec['specID'] == '3':
                        if equiptype_searched.parameter2_disable == False:
                            para_type = equiptype_searched.parameter3_type
                            if para_type == '0':  # numerical
                                try:
                                    para_value = int(spec['value'])
                                except:
                                    continue
                                equip_queryset = equip_queryset.filter(parameter3__lte=para_value,
                                                                       parameter3b__gte=para_value)
                            elif para_type == '1':  # enum
                                para_value = ',' + spec['value'] + ','
                                equip_queryset = equip_queryset.filter(parameter3__contains=para_value)
    else:
        equip_queryset = Equip.objects.all()
        Message = "No typeId input. All Equip returned."

    equip_list = []
    for equip in equip_queryset:
        json_template = equip.toJSON3()
        equip_list.append(json_template)
    return JsonResponse({"status":"Success","equipList":equip_list,"message":Message})


#########################################################


# API 9b POST rate finished
@csrf_exempt
def EventRate(request):
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})

    data = json.loads(request.body)
    try:
        event_updated = Event.objects.get(id=data['eventID'])
    except (ObjectDoesNotExist, KeyError):
        return JsonResponse({"status": "Error", "message": "input event not found."})

    if event_updated.eventType != "2" or event_updated.manager == event_updated.user:
        return JsonResponse({"status": "Error", "message": "invalid input event."})

    if event_updated.manager == request.user:
        if event_updated.user_rate != -1:
            return JsonResponse(
                {"status": "Error", "message": "event has been rated.", "user_rate": str(event_updated.user_rate)})
        try:
            if int(data['user_rate']) not in [0, 1, 2, 3, 4, 5]:
                raise ValueError
            event_updated.user_rate = int(data['user_rate'])
            event_updated.user_note = data.get('user_note', '')
            event_updated.save()
        except ValueError:
            return JsonResponse({"status": "Error", "message": "user_rate is not a valid integer"})
        except KeyError:
            return JsonResponse({"status": "Error", "message": "user_rate not found"})
        return JsonResponse({"status": "Success", "message": "Successfully rated"})
    elif event_updated.user == request.user:
        if event_updated.equip_rate != -1 or event_updated.manager_rate != -1:
            return JsonResponse(
                {"status": "Error", "message": "event has been rated.", "equip_rate": str(event_updated.equip_rate),
                 "manager_rate": str(event_updated.manager_rate)})
        try:
            if int(data['equip_rate']) not in [0, 1, 2, 3, 4, 5]:
                raise ValueError
            if int(data['manager_rate']) not in [0, 1, 2, 3, 4, 5]:
                raise ValueError
            event_updated.equip_rate = int(data['equip_rate'])
            event_updated.manager_rate = int(data['manager_rate'])
            event_updated.manager_note = data.get('manager_note', '')
            event_updated.save()
        except ValueError:
            return JsonResponse({"status": "Error", "message": "Rate is not a valid integer"})
        except KeyError:
            return JsonResponse({"status": "Error", "message": "Rate not found"})
        return JsonResponse({"status": "Success", "message": "Successfully rated"})
    return JsonResponse({"status": "Error", "message": "This event is not related to user."})


#######################################################
def EventDateHelper(Datetime):
    # json_template = {}
    # json_template['year'] = Datetime.year
    # json_template['month'] = Datetime.month
    # json_template['day'] = Datetime.day
    # json_template['hour'] = Datetime.hour
    # json_template['minute'] = Datetime.minute

    return Datetime.strftime('%Y-%m-%d %H:%M:%S')

############################################################

# API-3a'
# not used
@csrf_exempt
@api_view(['GET'])
def Bosslist(request):
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    boss_queryset = Account.objects.filter(userType='1')
    boss_list = []
    for boss in boss_queryset:
        json_template = {}
        json_template["id"] = boss.id
        json_template['email'] = boss.email
        json_template['username'] = boss.username
        json_template['firstName'] = boss.first_name
        json_template['lastName'] = boss.last_name
        json_template['userTypeID'] = boss.userType
        json_template['userType'] = boss.get_userType_display()
        if boss.lab != None:
            json_template['lab'] = boss.lab.id
            json_template['labName'] = boss.lab.name
        json_template['lab_pending'] = boss.lab_pending
        boss_list.append(json_template)
    return JsonResponse({"status": "Success", "boss_List": boss_list})


# API-3b
# not used
@csrf_exempt
def LabRequest(request):
    # input {"id":"<lab_id>"}
    # requirement: request.user has logged in and is a student without a valid lab
    # Method: Post
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if request.user.userType != "2":
        return JsonResponse({"status": "Error", "message": "The user is not a Student. Please retry."})
    if request.user.lab_pending == False:
        return JsonResponse({"status": "Error", "message": "The user already has a lab. Please retry."})
    data = json.loads(request.body)
    if 'id' not in data:
        return JsonResponse({"status": "Error", "message": "No lab id input.Please retry."})
    try:
        int(data['id'])
    except ValueError:
        return JsonResponse({"status": "Error", "message": "Lab id input is not an valid string with integer."})
    lab_queryset = Lab.objects.filter(id=int(data['id']))
    try:
        request.user.lab = lab_queryset.get(id=int(data['id']))
    except ObjectDoesNotExist:
        return JsonResponse({"status": "Error", "message": "Certain lab id does not exist.Please retry."})
    request.user.lab_pending = True
    request.user.save()
    return JsonResponse({"status": "Success", "message": "application recieved"})

# API-3c
# not used
@csrf_exempt
def LabAddStudentEmail(request):
    # input {"email":"<student_email>"}
    # requirement: request.user has logged in and is a boss with a valid lab
    # Method: Post
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if request.user.userType != "1":
        return JsonResponse({"status": "Error", "message": "The user is not a Boss. Please retry."})
    if not request.user.lab:
        return JsonResponse({"status": "Error", "message": "The boss doesn't have a lab. Please connect admin."})
    data = json.loads(request.body)
    if 'email' not in data:
        return JsonResponse({"status": "Error", "message": "No student email input.Please retry."})
    student_queryset = Account.objects.filter(email=data['email'])
    try:
        student = student_queryset.get(email=data['email'])
    except ObjectDoesNotExist:
        return JsonResponse({"status": "Error", "message": "Certain student email does not exist.Please retry."})

    if student.userType != "2":
        return JsonResponse({"status": "Error", "message": "The input user is not a student.Please retry."})
    if student.lab_pending == False:
        return JsonResponse({"status": "Error", "message": "The input student already has a lab.Please retry."})
    if student.lab != None and student.lab != request.user.lab:
        return JsonResponse(
            {"status": "Error", "message": "The input student is applying for another lab.Please retry."})
    student.lab = request.user.lab
    student.lab_pending = False
    studnet.has_access = True
    student.save()
    return JsonResponse({"status": "Success", "message": "successfully added."})

# API-4b finished 0721
# not used
@csrf_exempt
def AddEquip(request):
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if request.user.userType != "1":
        return JsonResponse({"status": "Error", "message": "The user is not a Boss. Please retry."})
    if not request.user.lab:
        return JsonResponse({"status": "Error", "message": "The boss doesn't have a lab. Please connect admin."})

    data = json.loads(request.body)
    new_equip = Equip()
    try:
        EquipType_queryset = EquipType.objects.filter(id=data.get('equipType'))
        Equiptype_temp = EquipType_queryset.get(id=data.get('equipType'))
    except ObjectDoesNotExist:
        return JsonResponse({"status": "Error", "message": "invalid EquipType."})
    new_equip.brand = data.get('brand','')
    new_equip.model = data.get('model','')
    new_equip.location = data.get('location','')
    new_equip.description = data.get('description','')
    new_equip.imgurl = data.get('imgurl','')
    new_equip.linkurl = data.get('linkurl','')
    new_equip.equip_type = Equiptype_temp
    new_equip.lab = request.user.lab
    # deal with parameter
    # not finished
    specs = data.get("specs")
    Message = ''
    if specs != None:
        for spec in specs:
            if spec.get('id') not in ["1", "2", "3"]:
                continue
            else:
                parameter_temp = spec.get('parameter')
                if spec.get('id') == "1":
                    if Equiptype_temp.parameter1_disable:
                        continue
                    parameter_type = Equiptype_temp.parameter1_type
                    parameter_note = Equiptype_temp.parameter1_note
                    if parameter_type == '0':  # numerical
                        parameter1 = ''
                        parameter1b = ''
                        for para in parameter_temp:
                            if para.get('id') == "1":
                                parameter1 = para.get('name')
                            elif para.get('id') == "2":
                                parameter1b = para.get('name')
                        try:
                            if parameter1 != '' and parameter1b != '':
                                if int(parameter1) >= int(parameter_note.split(',')[0]) \
                                        and int(parameter1b) <= int(parameter_note.split(',')[1])\
                                        and int(parameter1) <= int(parameter1b):
                                    new_equip.parameter1 = parameter1
                                    new_equip.parameter1b = parameter1b
                        except ValueError:
                            Message += "Parameter1 ValueError. "
                    elif parameter_type == '1':  # enum
                        parameter1 = ','
                        for para in parameter_temp:
                            if para.get('name') !='':
                                if para.get('name') in parameter_note.split(',') \
                                        and (',' + para.get('name') + ',') not in parameter1:
                                    parameter1 = parameter1 + para.get('name') + ','
                        if parameter1 != ',':
                            new_equip.parameter1 = parameter1

                if spec.get('id') == "2":
                    if Equiptype_temp.parameter2_disable:
                        continue
                    parameter_type = Equiptype_temp.parameter2_type
                    parameter_note = Equiptype_temp.parameter2_note
                    if parameter_type == '0':  # numerical
                        parameter2 = ''
                        parameter2b = ''
                        for para in parameter_temp:
                            if para.get('id') == "1":
                                parameter2 = para.get('name')
                            elif para.get('id') == "2":
                                parameter2b = para.get('name')
                        try:
                            if parameter2 != '' and parameter2b != '':
                                if int(parameter2) >= int(parameter_note.split(',')[0]) \
                                        and int(parameter2b) <= int(parameter_note.split(',')[1])\
                                        and int(parameter2) <= int(parameter2b):
                                    new_equip.parameter2 = parameter2
                                    new_equip.parameter2b = parameter2b
                        except ValueError:
                            Message += "Parameter2 ValueError. "
                    elif parameter_type == '1':  # enum
                        parameter2 = ','
                        for para in parameter_temp:
                            if para.get('name') !='':
                                if para.get('name') in parameter_note.split(',') \
                                        and (',' + para.get('name') + ',') not in parameter2:
                                    parameter2 = parameter2 + para.get('name') + ','
                        if parameter2 != ',':
                            new_equip.parameter2 = parameter2

                if spec.get('id') == "3":
                    if Equiptype_temp.parameter3_disable:
                        continue
                    parameter_type = Equiptype_temp.parameter3_type
                    parameter_note = Equiptype_temp.parameter3_note
                    if parameter_type == '0':  # numerical
                        parameter3 = ''
                        parameter3b = ''
                        for para in parameter_temp:
                            if para.get('id') == "1":
                                parameter3 = para.get('name')
                            elif para.get('id') == "2":
                                parameter3b = para.get('name')
                        try:
                            if parameter3 != '' and parameter3b != '':
                                if int(parameter3) >= int(parameter_note.split(',')[0]) \
                                        and int(parameter3b) <= int(parameter_note.split(',')[1])\
                                        and int(parameter3) <= int(parameter3b):
                                    new_equip.parameter3 = parameter3
                                    new_equip.parameter3b = parameter3b
                        except ValueError:
                            Message += "Parameter3 ValueError. "
                    elif parameter_type == '1':  # enum
                        parameter3 = ','
                        for para in parameter_temp:
                            if para.get('name') !='':
                                if para.get('name') in parameter_note.split(',') \
                                        and (',' + para.get('name') + ',') not in parameter3:
                                    parameter3 = parameter3 + para.get('name') + ','
                        if parameter3 != ',':
                            new_equip.parameter3 = parameter3
    if Message == '':
        new_equip.save()
        status = "Success"
    else:
        status = "Error"
    return JsonResponse({"status": status, 'Message': Message, "Library": new_equip.toJSON2()})

# API-6a finished
# not used
@csrf_exempt
def AuthEquipList(request):
    if request.method != 'GET':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    if not request.user.lab:
        return JsonResponse({"status": "Error", "message": "The user doesn't have a lab. Please retry."})

    if request.user.userType == '1':
        equip_queryset = Equip.objects.filter(lab=request.user.lab)
    elif request.user.userType == '2':
        equip_queryset = Equip.objects.filter(lab=request.user.lab, equip_auth__id=request.user.id)

    equip_list = []
    for equip in equip_queryset:
        equip_list.append(equip.toJSON3())
    return JsonResponse({"status": "Success", "equipList": equip_list})

# API 9a POST finish
# not used
@csrf_exempt
def EventFinish(request):
    if request.method != 'POST':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})

    data = json.loads(request.body)
    try:
        event_updated = Event.objects.get(id=data['eventid'])
    except (ObjectDoesNotExist, KeyError):
        return JsonResponse({"status": "Error", "message": "input event not found."})

    if (event_updated.user != request.user and event_updated.manager != request.user) \
            or event_updated.manager == event_updated.user:
        return JsonResponse({"status": "Error", "message": "invalid input event."})
    elif event_updated.finish:
        return JsonResponse({"status": "Error", "message": "input event has already finished."})
    else:
        event_updated.finish = True
        event_updated.save()
        return JsonResponse({"status": "Success", "message": "Successfully finish event."})


# not used
@csrf_exempt
def EquipDetail(request, equipid):
    if request.method != 'GET':
        return JsonResponse({"status": "Error", "message": "Bad request with wrong method."})
    if request.user.is_anonymous():
        return JsonResponse({"status": "Error", "message": "request with null user, please log in."})
    try:
        equip_to_show = Equip.objects.get(id = equipid)
    except ObjectDoesNotExist:
        return JsonResponse({"status": "Error", "message": "Equip not found."})

    return JsonResponse({"status":"Success","data":equip_to_show.toJSON()})

