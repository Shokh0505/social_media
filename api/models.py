import os
import time
from django.utils.deconstruct import deconstructible
from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    profile_image = models.ImageField(upload_to='post_images', null=True, blank=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)

    def __str__(self):
        return f"{self.first_name}, {self.last_name}, {self.email}, {self.profile_image}, {self.followers}"
    
    def is_following(self, user_id):
        return self.followers.filter(id=user_id).exists()
    

@deconstructible
class CustomUploadTo:
    def __init__(self, sub_path):
        self.sub_path = sub_path

    def __call__(self, instance, filename):
        base, ext = os.path.splitext(filename)
        filename = f"{base}_{int(time.time())}{ext}"
        return os.path.join(self.sub_path, filename)



class Post(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to=CustomUploadTo('posts/'), null=True, blank=True)

    def __str__(self):
        return f"Title: {self.title}"
    
    def is_owner(self, author_id):
        return self.author.pk == author_id
    
    
class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')

    @staticmethod
    def is_liked(user_id, post_id):
        return Like.objects.filter(post=post_id, user=user_id).exists()