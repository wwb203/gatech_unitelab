from rest_framework import serializers
from authentication.models import Account
from authentication.serializers import AccountSerializer
from posts.models import Post

class PostSerializer(serializers.ModelSerializer):
    author = AccountSerializer(read_only=True, required=False)
    class Meta:
        model = Post
        fields = ('id', 'author', 'content','create_at','update_at')
        read_only_fields = ('id', 'create_at', 'update_at')
    def get_validation_exclusions(self, *args, **kwargs):
        exclusions = super(PostSerializer, self).get_validation_exclusions()

        return exclusions + ['author']

