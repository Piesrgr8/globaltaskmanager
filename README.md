# Global Task Manager
## Beginning Development
To follow the project’s requirements, I thought the best project for this would be to make a task manager or to-do list, since it requires the fetching of tasks and the function to delete or add tasks. I figured the easiest way to begin was to start working on the Django project using the REST framework, since the frontend will be pulling from the Django project itself. First, we will focus on the local part of setting up Django.

### Backend
To begin this process, we need to install [python](https://www.python.org/), which can be done by going to their website and getting the installer. But for me, since I am on Linux Manjaro, it already comes pre-installed.
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
You'll also need to add this in the main project folder's `settings.py`
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

Our next step is the frontend, the easiest piece of the project to make.

### Frontend
What I am using for the frontend is ReactJS Typescript, because I figured this would be something that would accurately demonstrate my abilities with components.
To start, we need to have a seperate folder for our frontend, and this can be accomplished by running the npx command:
```
npx create-react-app taskmanager --template typescript
```
After that, we should change our directory to `taskmanager` and install a couple of useful packages.
* `Prettier` is a linter that can be ran using `npx prettier -w <project>`.
* `Axios` will replace Ajax requests with something a little more simpler. It will take on the responsibility of post, delete, and put requests.
* `Sass` is a language that is written in css, but multiple ids and classes can be nested.

Install these packages with this useful command here:
```
npm install -s prettier axios sass
```
And that is my setup! Since we are in the repository for it, you can see how its made from there. I used a total of 3 components to put into App.tsx.
* `TaskList` is the display container for all tasks.
* `TaskDetailModal` is a modal that displays when clicking on a task to edit or adding a task.
* `TaskForm` was part of the modal, but ended up getting remade inside the modal component itself.

### AWS
[Click here for pickup line](https://youtu.be/jk0gBZtTYUA?t=142)

The two services I will be focusing on are EC2 and S3. It's super easy to setup S3, so let's focus on something we'll definitly need to work first.

1. Navigate to EC2 and launch a new instance.
2. Name the EC2 whatever you'd like. Preferably something related to the project (we'll call it 'django-tasks').
3. Select `Ubuntu` and leave everything to its default setting.
4. Create a new key pair and save it as a .pem. PUT IT IN A SAFE PLACE.
5. Network settings are set to default as well, where it will create a new security group.

Now we have it created and running, we will now need to connect to it and yet again install the same stuff that we did on our local computer.
