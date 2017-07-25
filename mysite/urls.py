from django.contrib import admin
from django.conf.urls import url, include
from rest_framework_nested import routers
from authentication.views import AccountViewSet, LoginView,LogoutView
from posts.views import PostViewSet, AccountPostsViewSet, equipmentlist, searchEquipment
from posts.views import EquipSearch,PostEvent_NotProtected,GroupEquipList, EquipDetail,PostReserveEvent,AddEquip,EventRate,EventFinish,Eventlist,AuthEquipList,AuthUpdate,AuthList,AccountInfo, Bosslist,LabRequest,LabAddStudentEmail,LabApplicantList,LabDealApplicantID,EquipTypeList

admin.autodiscover()
router = routers.SimpleRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'posts', PostViewSet)
accounts_router = routers.NestedSimpleRouter(
        router, r'accounts', lookup='account'
        )
accounts_router.register(r'posts', AccountPostsViewSet)

from mysite.views import IndexView

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^AccountInfo/', AccountInfo),
    url(r'^LabApplicantList/', LabApplicantList),
    url(r'^LabDealApplicantID/', LabDealApplicantID),
    url(r'^EquipTypeList/', EquipTypeList),
    url(r'^AuthList/', AuthList),
    url(r'^AuthUpdate/', AuthUpdate),
    url(r'^Eventlist/(?P<equipid>.+)/$', Eventlist),
    url(r'^Eventlist/$', Eventlist),
    url(r'^EventRate/$', EventRate),
    url(r'^PostReserveEvent/$', PostReserveEvent),
    url(r'^EquipDetail/(?P<equipid>.+)/$', EquipDetail),
    url(r'^GroupEquipList/$', GroupEquipList),
    url(r'^EventUpdate/$', PostEvent_NotProtected),
    url(r'^EquipSearch/$', EquipSearch),
    url(r'^api/v1/', include(router.urls)),
    url(r'^api/v1/', include(accounts_router.urls)),
    url(r'^api/v1/eqiupmentlist/$', equipmentlist, name='equipmentlist'),
    url(r'^api/v1/specs/search/$', searchEquipment, name='searchEquipment'),
    url(r'^api/v1/auth/login/$', LoginView.as_view(), name='login'),
    url(r'^api/v1/auth/logout/$', LogoutView.as_view(), name='logout'),
    url('^.*$', IndexView.as_view(), name='index'),
]

