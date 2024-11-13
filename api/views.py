from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate
from .serializers import UserSerializer, PostSerializer, PostSerializerCreate
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import User, Post, Like
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json


# Sign-up view
class UserSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        
        all_inputs = [
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name',
        ]

        # Get the inputs and validate them

        for key in request.data.keys():
            if key not in all_inputs:
                return Response(
                        {'message': f'{key} has not been sent'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        if request.data['password'] != request.data['password2']:
            return Response(
                        {'message': 'The passwords must match'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        data = request.data

        # Create the user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        
        user.set_password(data['password'])
        user.save()

        return Response({'message': 'successfully signed up!'}, status=status.HTTP_200_OK)

class Login_view(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({"message": "The input fields should not be empty"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)

        if user is not None:
            token, create = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "id": user.id, "message": "Login successful!"})
        else:
            return Response({"message": "invalid credentials"})


def index(request):
    return render(request, 'api/index.html')

class Profile_view(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user is None:
            return Response({"Message": "The configuration has been changed. Please try again after loggin in again"})

        serializer = UserSerializer(user)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class Profile_image_upload(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class Create_post(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = PostSerializerCreate(data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save(author=request.user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        post_id = request.data.get('post_id')

        try:
            post = Post.objects.get(id=post_id, author=request.user)
        except Post.DoesNotExist:
            return Response({'message': 'The post has not been found or you are not an author'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PostSerializer(post, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def put(self, request):
    #     post_id = request.data.get('post_id')
    #     user = request.user

    #     if not post_id:
    #         return Response({'message': 'Post id has not been provided'}, status=status.HTTP_400_BAD_REQUEST)

    #     post = Post.objects.get(id=post_id)

    #     if not post:
    #         return Response({'message': 'Post id has not been provided correctly'}, status=status.HTTP_400_BAD_REQUEST)

    #     is_owner = post.is_owner(user.id)

class Get_post(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]    

    def post(self, request):
        post_id = request.data.get('post_id')
        user = request.user

        if not post_id:
            return Response({'message': 'Post id has not been provided'}, status=status.HTTP_400_BAD_REQUEST)

        post = Post.objects.get(id=post_id)

        if not post:
            return Response({'message': 'Post id has not been provided correctly'}, status=status.HTTP_400_BAD_REQUEST)

        is_owner = post.is_owner(user.id)

        if not is_owner:
            return Response({'message': "You cannot modify other people's post"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PostSerializer(post)

        return Response({"post": serializer.data}, status=status.HTTP_200_OK)


class PostListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        posts = Post.objects.all().order_by('-created_at')
        paginator = PageNumberPagination()
        paginator.page_size = 10

        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(paginated_posts, many=True)

        return paginator.get_paginated_response(serializer.data)
    
class Get_user_info(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get('username')

        if not username:
            return Response("Invalid username", status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.get(username=username)
        serializer = UserSerializer(user)
        followers = user.followers.count()
        following = user.following.count()

        response_data = serializer.data
        response_data['following'] = following
        response_data['followers'] = followers

        return Response(response_data, status=status.HTTP_200_OK)
    
class Follow_user(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id = request.data.get("post_id")
        author = request.data.get("author")
        user = request.user


        # Check if there is a user with this username
        try:
            author = User.objects.get(username=author["username"])
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            return Response({"message" : "Invalid author post"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if he is the owner of the post
        try:
            post = Post.objects.get(id=id)
        except (Post.DoesNotExist, Post.MultipleObjectsReturned):
            return Response({"message": "You don't want to mess with my website 1!!!"}, status=status.HTTP_400_BAD_REQUEST)
        
        is_owner = post.is_owner(user.id)
        if is_owner:
            return Response({"message": "You don't want to mess with my website 2!!!"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user already follows the author
        is_following = user.is_following(author.id)
        if is_following:
            return Response({"message": "You already follow the user"}, status=status.HTTP_400_BAD_REQUEST)
        
        # If everything is alright, add the user to the following author
        author.followers.add(user)
        
        return Response({"message": "Successfully added to the following"}, status=status.HTTP_200_OK)
    
class Like_post(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id = request.data.get('post_id')
        if not id:
            return Response({"message": "Try again without changing the html"}, status=status.HTTP_400_BAD_REQUEST)
                        
        post = Post.objects.get(id=id)
        if not post:
            return Response({"message": "Try again without changing the html"}, status=status.HTTP_400_BAD_REQUEST)

        is_owner = post.is_owner(request.user.id)
        if is_owner:
            return Response({"message": "You cannot like your own post! C'mon just write quality content you will get likes."}, status=status.HTTP_400_BAD_REQUEST)

        like, created = Like.objects.get_or_create(user=request.user, post=post)

        if not created:
            like.delete()

        return Response({"message": "Successfully liked or unliked the post"}, status=status.HTTP_200_OK)
    
class is_follower(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        want_to_follow_id = request.data.get("author_id")

        if not want_to_follow_id:
            return Response({"message": "No id provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            want_to_follow_user = User.objects.get(id=want_to_follow_id)
        except User.DoesNotExist:
            return Response({"message": "Invalid user id"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        is_following = user.is_following(want_to_follow_user.id)
        
        if is_following:
            return Response({"following": True}, status=status.HTTP_200_OK)
        return Response({"following": False}, status=status.HTTP_200_OK)

class Unfollow(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        unfollow_user_id = request.data.get("author_id")
        user= request.user
        if not unfollow_user_id:
            return Response({"message": "Could not find the id with this id"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            unfollow_user = User.objects.get(id=unfollow_user_id)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            return Response({"message": "Invalid author id"}, status=status.HTTP_400_BAD_REQUEST)
        
        unfollow_user.followers.remove(user)

        return Response({"message": "Successfully removed from the following"}, status=status.HTTP_200_OK)

class User_liked(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        post_id = request.data.get("post_id")
        user = request.user

        if not post_id: 
            return Response({"message": "Post id could not be found"}, status=status.HTTP_200_OK)
        
        liked = Like.is_liked(user_id=user.id, post_id=post_id)
        post = Post.objects.get(id=post_id)
        likes = post.likes.count()

        if liked:
            return Response({"liked": True, "likes": likes}, status=status.HTTP_200_OK)
        return Response({"liked": False, "likes": likes}, status=status.HTTP_200_OK)
    
class Following_posts(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        following_people = user.following.all()
        posts = Post.objects.filter(author__in=following_people).order_by('-created_at')
        paginator = PageNumberPagination()
        paginator.page_size = 10
        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(paginated_posts, many=True)

        return paginator.get_paginated_response(serializer.data)

class Following_users(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        followings = user.following.all()

        if followings:
            serializer = UserSerializer(followings, many=True)                
        
        return Response({"following_users": serializer.data}, status=status.HTTP_200_OK)

class Get_username_with_letters(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        letters = request.data.get('letters')

        following_users = user.following.filter(username__istartswith=letters)
        following_users = UserSerializer(following_users, many=True)

        return Response({'following_users': following_users.data}, status=status.HTTP_200_OK)

class Get_profile_posts(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get('username')

        if not username:
            return Response({'message': 'no username has been provided'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.get(username=username)

        if user is None:
            return Response({'message': 'invalid username provided'}, status=status.HTTP_400_BAD_REQUEST)

        posts = user.posts.all().order_by('-created_at')
        serializer = PostSerializer(posts, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)