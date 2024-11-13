from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name='index'),
    path('signup/', views.UserSignupView.as_view(), name='signup'),
    path("login/", views.Login_view.as_view(), name='login'),
    path("profile_info/", views.Profile_view.as_view(), name="profile_info"),
    path("profile_image/", views.Profile_image_upload.as_view(), name="profile_image"),
    path("create_post/", views.Create_post.as_view(), name="create_post"),
    path("post_list/", views.PostListView.as_view(), name="post_list"),
    path("get_user_info/", views.Get_user_info.as_view(), name="get_user_info"),
    path("follow_user/", views.Follow_user.as_view(), name="follow user"),
    path("like_post/", views.Like_post.as_view(), name="like_post"),
    path("is_follower/", views.is_follower.as_view(), name="is_follower"),
    path("unfollow/", views.Unfollow.as_view(), name="unfollow"),
    path("user_liked/", views.User_liked.as_view(), name="user_liked"),
    path("following_posts/", views.Following_posts.as_view(), name="following_posts"),
    path("following_users/", views.Following_users.as_view(), name="following_users"),
    path("get_following_letters/", views.Get_username_with_letters.as_view(), name="following_users_letters"),
    path("get_profile_posts/", views.Get_profile_posts.as_view(), name="get_profile_posts"),
    path("get_post/", views.Get_post.as_view(), name="ge_post")
]