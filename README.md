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

## AWS
### Backend
[Click here for pickup line](https://youtu.be/jk0gBZtTYUA?t=142)

The two services I will be focusing on are EC2 and S3. It's super easy to setup S3, so let's focus on something we'll definitly need to work first.

1. Navigate to EC2 and launch a new instance.
2. Name the EC2 whatever you'd like. Preferably something related to the project (we'll call it 'django-tasks').
3. Select `Ubuntu` and leave everything to its default setting.
4. Create a new key pair and save it as a .pem. PUT IT IN A SAFE PLACE.
5. Network settings are set to default as well, where it will create a new security group.

Now we have it created and running, we will now need to connect to it and yet again install the same stuff that we did on our local computer. To do this, I will use the terminal on my computer.

To do this, enter this command:
```
ssh -i <name-of-key>.pem ubuntu@<ec2-public-address>
```

Start off using this command to allow OpenSSH on the server:
```
sudo ufw allow OpenSSH && sudo ufw enable
```

Now, let's use this command to install our essentials for django to work:
```
sudo apt update && sudo apt install python3-pip python3-venv python3-dev libpq-dev postgresql postgresql-contrib nginx curl
```

Just so we are organized, lets create a directory for our project:
```
mkdir <project-name> && cd <project-name>
```

We will create our virtual environment within this project folder:
```
python3 -m venv venv && source venv/bin/activate
```

Remember back when we did the local django server and had to install these pip packages?:
```
pip install django djangorestframework gunicorn
```
I added a couple for later

Typically, you'd want your project version controlled so that it can be accessed securly for this process, but I didn't do this because it was simple enough to transfer over using FTP and have the server made there using VIM.

If it is version controlled, clone the repo using `git clone` and then work from there. But, for this, open your favorite FTP client. For me, it's `FileZilla`.

1. Open FileZilla.
2. Create a new site.
3. Fill in details:
* Username: ubuntu
* Host: Public IPV4
* Method: SFTP
4. Select .pem file as password.

Now navigate to the project folder and drag & drop the entire django project folder into it. Once that's done, you can safely disconnect.

Let's convert our database to postgresql before we continue to migrate.

Then, we will add all of the necessary data so that we have a user with total control (RUN ONE COMMAND AT A TIME):
```
CREATE DATABASE taskmanager;
CREATE USER your_db_user WITH PASSWORD 'your_password';
ALTER ROLE your_db_user SET client_encoding TO 'utf8';
ALTER ROLE your_db_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE your_db_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE taskmanager TO your_db_user;
\q
```

Within the settings.py, it will have settings for databases, but missing a couple fields. Let's add them!
```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'taskmanager',
        'USER': 'ubuntu',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '',
    }
}
```

While we are in this file, lets define where our static files are going to be. This will be useful for our setup later.
Below the line `STATIC_URL`, lets add this section here:
```
import os
STATIC_ROOT = os.path.join(BASE_URL, 'static/')
```

And of course, run this command to see if it worked:
```
python manage.py collectstatic
```

It should also be safe now to execute `python manage.py migrate` or if haven't yet, `python manage.py makemigrations`

Now, we could just run `python manage.py runserver` and call it a day, but I really wanted to use nginx and gunicorn for this setup.
So, what we do is run `deactivate` in the command line and start modifying files.

Let's use `sudo nano` to edit a file `/etc/systemd/system/gunicorn.socket`
```
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
```

Then, lets `sudo nano` another file `/etc/systemd/system/gunicorn.service`
```
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/<foldername>/<project folder>
ExecStart=/home/ubuntu/<foldername>/venv/bin/gunicorn \
    --access-logfile - \
    --workers 3 \
    --bind unix:/run/gunicorn.sock \
    --<appname>.wsgi:application

[Install]
WantedBy=multi.user.target
```

Afterwards, we need to activate this service by using these commands:
```
sudo systemctl start gunicorn.socket && sudo systemctl enable gunicorn.socket
```

We should also double check that the file exists by running `file /run/gunicorn.socket`
And also, check to see if the server is running with no error:
```
sudo systemctl status gunicorn && curl --unix-socket /run/gunicorn.sock localhost
```

It should return something like 'Not Found' or 'Resource not found', because if not, we need to run a command to see whats wrong:
```
sudo systemctl status gunicorn
```

Now we should be good and the server is running!
To eliminate the port number, nginx comes in to help!

Yet again, we'll need to `sudo nano` a file at `/etc/nginx/sites-available/djangotasks`
```
server {
    listen 80;
    server_name <public_ipv4>;

    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /home/ubuntu/<foldername>/<project-name>;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}
```

Then we'll run this line to link two folders together:
```
sudo ln -s /etc/nginx/sites-available/djangotasks /etc/nginx/sites-enabled
```

To check and see if our syntax is correct, we run `sudo nginx -t` and afterwards run this:
```
sudo systemctl restart nginx && sudo ufw allow 'Nginx Full'
```

If we head back to our browser and in our EC2, navigate to the security tab and click on our security group. Make sure our rules look like this:
![Screenshot 2024-07-19 105403](https://github.com/user-attachments/assets/e3a7da64-da84-4d1a-9209-21d40a75696f)
The bottom refers to the SSH from the terminal if you care about security.

Test the server to see if it works at http://<public-ipv4>

### Frontend
We simply go to our react project and run `npm run build`. Then on S3, we'll create a new S3 with a recognizable name, and uncheck `block public access`.
We can now upload everythin inside the build folder in our project, go to the properties tab and enable static hosting, and then go to the permissions tab to add this policy:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<S3-bucket-name>/*"
        }
    ]
}
```

And that's it! The frontend is live!
