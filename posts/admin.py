from django.contrib import admin
from posts.models import  EquipType,Lab,Equip,Event

# Register your models here.

admin.site.register(Equip)
admin.site.register(Lab)
admin.site.register(EquipType)
admin.site.register(Event)