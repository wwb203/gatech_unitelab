from django.conf.urls import patterns, url, include
from rest_framework_nested import routers
from authentication.views import AccountViewSet, LoginView,LogoutView
from posts.views import PostViewSet, AccountPostsViewSet, equipmentlist, searchEquipment
router = routers.SimpleRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'posts', PostViewSet)
accounts_router = routers.NestedSimpleRouter(
        router, r'accounts', lookup='account'
        )
accounts_router.register(r'posts', AccountPostsViewSet)

from thinkster_django_angular_boilerplate.views import IndexView

urlpatterns = patterns(
    '',
    url(r'^api/v1/', include(router.urls)),
    url(r'^api/v1/', include(accounts_router.urls)),
    url(r'^api/v1/eqiupmentlist/$', equipmentlist, name='equipmentlist'),
    url(r'^api/v1/specs/search/$', searchEquipment, name='searchEquipment'),
    url(r'^api/v1/auth/login/$', LoginView.as_view(), name='login'),
    url(r'^api/v1/auth/logout/$', LogoutView.as_view(), name='logout'),
    url('^.*$', IndexView.as_view(), name='index'),
)
