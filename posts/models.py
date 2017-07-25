from django.db import models

from authentication.models import Account


# Create your models here.
class Post(models.Model):
    author = models.ForeignKey(Account)
    content = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.content


class EquipType(models.Model):
    id = models.AutoField(primary_key=True)
    TYPE_PARAMETER_CHOICE = (
        ('0', 'numerical'),
        ('1', 'enum'),
        ('2', 'boolean'),
        ('3', 'string'),
    )
    name = models.CharField(max_length=255, unique=True)
    parameter1_disable = models.BooleanField(default=False)
    parameter1_name = models.CharField(max_length=255, blank=True)
    parameter1_type = models.CharField(max_length=255, choices=TYPE_PARAMETER_CHOICE, blank=True, null=True)
    parameter1_note = models.CharField(max_length=255, blank=True)
    parameter2_disable = models.BooleanField(default=False)
    parameter2_name = models.CharField(max_length=255, blank=True)
    parameter2_type = models.CharField(max_length=255, choices=TYPE_PARAMETER_CHOICE, blank=True, null=True)
    parameter2_note = models.CharField(max_length=255, blank=True)
    parameter3_disable = models.BooleanField(default=False)
    parameter3_name = models.CharField(max_length=255, blank=True)
    parameter3_type = models.CharField(max_length=255, choices=TYPE_PARAMETER_CHOICE, blank=True, null=True)
    parameter3_note = models.CharField(max_length=255, blank=True)

    # for emulate-type parameter, the parameter_note attribute should be in 'emu1,emu2,emu3' format
    # for numerical-type parameter, the parameter_note attribute should be in 'min,max' format
    def __unicode__(self):
        return self.name

    def toJSON2(self):
        EquipDict = {}
        EquipDict['id'] = self.id
        EquipDict['name'] = self.name
        specs = []

        parameter1 = {'id': 1, 'disable': self.parameter1_disable}
        if not self.parameter1_disable:
            parameter1['name'] = self.parameter1_name
            parameter1['paraType'] = self.get_parameter1_type_display()
            parameter = []
            temp_note = self.parameter1_note.split(',')
            id_temp = 1
            # 0 for Any , 1 for min, 2 for max
            for note in temp_note:
                parameter.append({'id': id_temp, 'name': note})
                id_temp += 1
            parameter1['parameter'] = parameter
        specs.append(parameter1)

        parameter2 = {'id': 2, 'disable': self.parameter2_disable}
        if not self.parameter2_disable:
            parameter2['name'] = self.parameter2_name
            parameter2['paraType'] = self.get_parameter2_type_display()
            parameter = []
            temp_note = self.parameter2_note.split(',')
            id_temp = 1
            # 0 for Any , 1 for min, 2 for max
            for note in temp_note:
                parameter.append({'id': id_temp, 'name': note})
                id_temp += 1
            parameter2['parameter'] = parameter
        specs.append(parameter2)

        parameter3 = {'id': 3, 'disable': self.parameter3_disable}
        if not self.parameter3_disable:
            parameter3['name'] = self.parameter3_name
            parameter3['paraType'] = self.get_parameter3_type_display()
            parameter = []
            temp_note = self.parameter3_note.split(',')
            id_temp = 1
            # 0 for Any , 1 for min, 2 for max
            for note in temp_note:
                parameter.append({'id': id_temp, 'name': note})
                id_temp += 1
            parameter3['parameter'] = parameter
        specs.append(parameter3)

        EquipDict['specs'] = specs

        return EquipDict
    def toJSON3_disable_related(self):
        EquipDict = {}
        EquipDict['id'] = self.id
        EquipDict['name'] = self.name
        specs = []


        if not self.parameter1_disable:
            parameter1 = {'id': 1, 'disable': self.parameter1_disable}
            parameter1['name'] = self.parameter1_name
            parameter1['paraType'] = self.get_parameter1_type_display()
            parameter = []
            temp_note = self.parameter1_note.split(',')
            id_temp = 1
            # 0 for Any , 1 for min, 2 for max
            for note in temp_note:
                parameter.append({'id': id_temp, 'name': note})
                id_temp += 1
            parameter1['parameter'] = parameter
            specs.append(parameter1)


        if not self.parameter2_disable:
            parameter2 = {'id': 2, 'disable': self.parameter2_disable}
            parameter2['name'] = self.parameter2_name
            parameter2['paraType'] = self.get_parameter2_type_display()
            parameter = []
            temp_note = self.parameter2_note.split(',')
            id_temp = 1
            # 0 for Any , 1 for min, 2 for max
            for note in temp_note:
                parameter.append({'id': id_temp, 'name': note})
                id_temp += 1
            parameter2['parameter'] = parameter
            specs.append(parameter2)



        if not self.parameter3_disable:
            parameter3 = {'id': 3, 'disable': self.parameter3_disable}
            parameter3['name'] = self.parameter3_name
            parameter3['paraType'] = self.get_parameter3_type_display()
            parameter = []
            temp_note = self.parameter3_note.split(',')
            id_temp = 1
            # 0 for Any , 1 for min, 2 for max
            for note in temp_note:
                parameter.append({'id': id_temp, 'name': note})
                id_temp += 1
            parameter3['parameter'] = parameter
            specs.append(parameter3)

        EquipDict['specs'] = specs

        return EquipDict

    def toJSON(self):
        import json
        return json.dumps(dict([(attr, getattr(self, attr)) for attr in [f.name for f in self._meta.fields]]))

    class Meta:
        db_table = 'Type_table'


class Lab(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    location = models.TextField()

    def toJSON2(self):
        LabDict = {'id' : self.id,'name':self.name,'location':self.location}

    def __unicode__(self):
        return self.name

    class Meta:
        db_table = 'Lab_table'



class Equip(models.Model):
    id = models.AutoField(primary_key=True)
    brand = models.CharField(max_length=255, blank=True)
    model = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    imgurl = models.CharField(max_length=255, blank=True)
    linkurl = models.CharField(max_length=255, blank=True)
    equip_type = models.ForeignKey(EquipType, related_name='equip_Type')
    parameter1 = models.CharField(max_length=255, blank=True)
    parameter1b = models.CharField(max_length=255, blank=True)
    parameter2 = models.CharField(max_length=255, blank=True)
    parameter2b = models.CharField(max_length=255, blank=True)
    parameter3 = models.CharField(max_length=255, blank=True)
    parameter3b = models.CharField(max_length=255, blank=True)
    lab = models.ForeignKey(Lab, related_name='lab_equip')

    def toJSON2_raw(self):
        EquipDict=  {
            'id':self.id, 'brand':self.brand,"model":self.model,
            'location':self.location, 'description':self.description,
            'imgurl':self.imgurl,'linkurl':self.linkurl,
            'equipTypeId':self.equip_type.id, 'equipType':self.equip_type.name,
            'parameter1Type':self.equip_type.get_parameter1_type_display(),
            'parameter1':self.parameter1,'parameter1b':self.parameter1b,
            'parameter2Type': self.equip_type.get_parameter2_type_display(),
            'parameter2': self.parameter2, 'parameter2b': self.parameter2b,
            'parameter3Type': self.equip_type.get_parameter3_type_display(),
            'parameter3': self.parameter3, 'parameter3b': self.parameter3b,
            'labID':str(self.lab.id),"lab":self.lab.name
        }
        return EquipDict

    def toJSON_nospecs(self):
        EquipDict = {
            'id': self.id, 'brand': self.brand,"model":self.model,
            'location': self.location, 'description': self.description,
            'imgurl': self.imgurl, 'linkurl': self.linkurl,
            'equipTypeID': str(self.equip_type.id), 'equipType': self.equip_type.name,
            'labID': str(self.lab.id),"lab":self.lab.name
        }
        return EquipDict

    def toJSON3(self):
        EquipDict = self.toJSON_nospecs()
        EquipDict['specs'] = self.get_specs()
        return EquipDict

    def get_specs(self):
        specs = []
        type = self.equip_type
        if not type.parameter1_disable:
            para1 = {}
            para1['id'] = '1'
            para1['name'] = type.parameter1_name
            para1['paraType'] = type.get_parameter1_type_display()
            para1['parameter'] = []
            if type.parameter1_type == "0": # numerical
                para1['parameter'].append({"id": "1", "name": self.parameter1})
                para1['parameter'].append({"id": "2", "name": self.parameter1b})
            elif type.parameter1_type == "1": # enum
                enum_temp = self.parameter1.split(',')
                i = 1
                for enum in enum_temp:
                    if enum != '':
                        para1['parameter'].append({'id':str(i),"name":enum})
                        i+=1
            specs.append(para1)

        if not type.parameter2_disable:
            para2 = {}
            para2['id'] = '2'
            para2['name'] = type.parameter2_name
            para2['paraType'] = type.get_parameter2_type_display()
            para2['parameter'] = []
            if type.parameter2_type == "0": # numerical
                para2['parameter'].append({"id": "1", "name": self.parameter2})
                para2['parameter'].append({"id": "2", "name": self.parameter2b})
            elif type.parameter2_type == "1": # enum
                enum_temp = self.parameter2.split(',')
                i = 1
                for enum in enum_temp:
                    if enum != '':
                        para2['parameter'].append({'id':str(i),"name":enum})
                        i+=1
            specs.append(para2)

        if not type.parameter3_disable:
            para3 = {}
            para3['id'] = '3'
            para3['name'] = type.parameter3_name
            para3['paraType'] = type.get_parameter3_type_display()
            para3['parameter'] = []
            if type.parameter3_type == "0": # numerical
                para3['parameter'].append({"id": "1", "name": self.parameter3})
                para3['parameter'].append({"id": "2", "name": self.parameter3b})
            elif type.parameter3_type == "1": # enum
                enum_temp = self.parameter3.split(',')
                i = 1
                for enum in enum_temp:
                    if enum != '':
                        para3['parameter'].append({'id':str(i),"name":enum})
                        i+=1
            specs.append(para3)

        return specs

    def __unicode__(self):
        return self.lab.name +' '+ self.equip_type.name +' '+ str(self.id)

    class Meta:
        db_table = 'Equip_table'


class Event(models.Model):
    id = models.AutoField(primary_key=True)
    TYPE_EVENT_CHOICE = (
        ('0', 'share'),
        ('1', 'group'),
        ('2', 'reserve'),
    )
    title = models.CharField(max_length = 100,blank = True,null = True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    finish = models.BooleanField(default=False)
    eventType = models.CharField(max_length=20, choices=TYPE_EVENT_CHOICE)
    equip = models.ForeignKey(Equip, related_name='event_equip')
    manager = models.ForeignKey(Account, related_name='event_manager')
    user = models.ForeignKey(Account, related_name='event_user')
    user_rate = models.IntegerField(default = -1)
    user_note = models.TextField(blank=True)
    manager_rate = models.IntegerField(default = -1)
    manager_note = models.TextField(blank=True)
    equip_rate = models.IntegerField(default = -1)
    disable = models.BooleanField(default= False)

    def toJson(self):
        json_template = {}
        json_template['title'] = self.title
        json_template['id'] = self.id
        json_template['start_time'] = self.EventDateHelper(self.start_time)
        json_template['end_time'] = self.EventDateHelper(self.end_time)
        json_template['finish'] = self.finish
        json_template['eventTypeID'] = self.eventType
        json_template['eventType'] = self.get_eventType_display()
        json_template['type'] = self.get_eventType_display()
        json_template['location'] = self.equip.location
        json_template['equipID'] = self.equip.id
        json_template['managerID'] = self.manager.id
        json_template['userID'] = self.user.id
        json_template['equip'] = self.equip.__unicode__()
        json_template['user'] = self.user.username
        json_template['manager'] = self.manager.username
        json_template['user_rate'] = self.user_rate
        json_template['user_note'] = self.user_note
        json_template['manager_rate'] = self.manager_rate
        json_template['manager_note'] = self.manager_note
        json_template['equip_rate'] = self.equip_rate
        json_template['disable'] = self.disable
        return json_template

    def EventDateHelper(self,Datetime):
        return Datetime.strftime('%Y-%m-%d %H:%M:%S')

    def __unicode__(self):
        return self.get_eventType_display()+' '+self.manager.username +' '+ str(self.id)

    class Meta:
        db_table = 'Event_table'
