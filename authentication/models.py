from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Create your models here.
class AccountManager(BaseUserManager):
    def create_user(self, email, password=None, **kwargs):
        print("AccountManager, create user")
        if not email:
            raise ValueError('Users must have a valid email address.')
        if not kwargs.get('username'):
            raise ValueError('Users must have a valid username.')
        account = self.model(
                email=self.normalize_email(email), username=kwargs.get('username'),
                )
        if kwargs.get('userType') == '1' or kwargs.get('userType')=='Boss':
            account.userType = '1'
        account.set_password(password)
        account.save()
        return account
    def create_superuser(self, email, password, **kwargs):
        print("AccountManager, create superuser")

        account = self.create_user(email, password, **kwargs)

        account.is_admin = True
        account.is_staff = True
        account.save()

        return account

class Account(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=40, unique=True)

    first_name = models.CharField(max_length=40, blank=True)
    last_name = models.CharField(max_length=40, blank=True)
    tagline = models.CharField(max_length=140, blank=True)
    boss_email = models.EmailField(blank = True)

    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    has_access = models.BooleanField(default=False)
    is_boss = models.BooleanField(default=False)

    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    equip_auth = models.ManyToManyField('posts.Equip', related_name='equip_auth',blank=True)
    TYPE_PERSON_CHOICE = (
        ('1', 'Boss'),
        ('2', 'Student'),
    )
    userType = models.CharField(max_length=20, choices=TYPE_PERSON_CHOICE, default='2')
    lab = models.ForeignKey('posts.Lab', related_name='lab_user', blank=True, null = True)
    lab_pending = models.NullBooleanField(default = True)

    objects = AccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __unicode__(self):
        return self.email
    def get_full_name(self):
        return ' '.join([self.first_name, self.last_name])
    def get_short_name(self):
        return self.first_name
    def has_perm(self, perm, obj=None):
        if self.is_admin and self.is_staff:
            return True
    def has_module_perms(self,app_label):
        if self.is_admin and self.is_staff:
            return True
