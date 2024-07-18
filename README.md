### Beginning Development
To follow the project’s requirements, I thought the best project for this would be to make a task manager or to-do list, since it requires the fetching of tasks and the function to delete or add tasks. I figured the easiest way to begin was to start working on the Django project using the REST framework, since the frontend will be pulling from the Django project itself. First, we will focus on the local part of setting up Django.
To begin this process, we need to install (python)[https://www.python.org/], which can be done by going to their website and getting the installer. But for me, since I am on Linux Manjaro, it already comes pre-installed.
After we are done there, the rest needs to be done in a virtual environment for python to install all of its dependencies for Django. Preferrably in the same folder where our application will be made.
```
python -m venv envname
```
Now, we need to install the necessary packages for django, starting with django and then the rest framework.
```
pip install django djangorestframework
```
We will now start creating the project and then creating the app within its folder.
```
django-admin startproject taskapp
cd taskapp

python manage.py startapp taskmanager
```
So far, we now have a django project to start working on, but we need to define the installed apps so that when the server runs, it knows what apps to depend on.
Add to your taskmanager/settings.py by using either vscode or gui nano from the terminal.
```
INSTALLED_APPS = [
    ...
    'rest_framework',
    'myapp',
]
```
We are now getting into the programming side of the Django project. Just like my previous experience before, using AdonisJS, I learned that you'll need to create migrations for the database when its made. This is no different to what needs to happen on Django, where you need to create the migrations through these different python files.
Let's start with the models first:
```
from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
```
Then we get on to serializers:
```
from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'description']
```
The API views, which are technically the two endpoints that will exist on the server:
```
from rest_framework import generics
from .models import Item
from .serializers import ItemSerializer

class ItemListCreate(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
```
Then we move on to the URL patterns, which are links that the server can recognize:
```
from django.urls import path
from .views import ItemListCreate, ItemDetail

urlpatterns = [
    path('items/', ItemListCreate.as_view(), name='item-list-create'),
    path('items/<int:pk>/', ItemDetail.as_view(), name='item-detail'),
]
```
You'll also need to add this in the main project folder's settings.py
```
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),
]
```
We can finally start making the migrations and then adding it to the database:
```
python manage.py makemigrations
python manage.py migrate
```
Once you've ensured that there are no more errors popping up, its time to start running the server by running this command:
```
python manage.py runserver
```
It will now be running on localhost:8000 by default.
