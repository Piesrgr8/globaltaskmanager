# Global Task Manager
[Access the finished product here!](http://globaltaskmanager.s3-website-us-east-1.amazonaws.com/index.html)
## Beginning Development
To meet the project's requirements, I decided to develop a task manager or to-do list. This project involves fetching tasks and providing functionalities to add or delete tasks. I started with the Django project using the REST framework, as the frontend would pull data from the Django project. Initially, I focused on setting up Django locally.

I am working on a custom-built PC with Linux Manjaro and using VSCode or VIM for code editing. VIM is good for minor changes, but VSCode, with the React Snippets plugin, greatly simplifies the creation of React components.

### Backend
To begin, I installed Python (for Linux Manjaro, Python is pre-installed). Next, I created a virtual environment to install Django and its dependencies:
```
python -m venv envname
pip install django djangorestframework
```
The following will create the Django project and app:
```
django-admin startproject taskapp
cd taskapp

python manage.py startapp taskmanager
```
Once the Django project is created, we need to define the installed apps so that when the server runs, it knows what apps to depend on.
This is accomplished by updating `INSTALLED_APPS` in `taskmanager/settings.py` using either vscode or gui nano from the terminal:
```
INSTALLED_APPS = [
    ...
    'rest_framework',
    'myapp',
]
```
Now we can delve into the programming side of the Django project. Just as with AdonisJS, migrations must be created when th database is made. On Django, migrations are created through these different python files.
We'll start with the models first:
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
The API views are technically the two endpoints that will exist on the server:
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
We'll also need to add this in the main project folder's `settings.py`:
```
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),
]
```
We can finally start making the migrations and add them to the database:
```
python manage.py makemigrations
python manage.py migrate
```
Once error testing is complete, it's time to start running the server:
```
python manage.py runserver
```
It will be running on localhost:8000 by default.

The next step is the frontend.

### Frontend
For the frontend, I used ReactJS with TypeScript to demonstrate my proficiency with components. To start, we need to have a seperate folder for our frontend, which is accomplished by running the npx command:
```
npx create-react-app taskmanager --template typescript
```
After that, we should change our directory to `taskmanager` and install a couple of useful packages:
* `Prettier` is a linter that can be run using `npx prettier -w <project-directory>`.
* `Axios` simplifies Ajax requests. It will take on the responsibility of post, delete, and put requests.
* `Sass` is a language that is written in css, but multiple IDs and classes can be nested.

Install these packages with this command:
```
npm install -s prettier axios sass
```
And that is my setup! Since we are in the repository for it, you can see how it's made from there. I used 3 components to put into App.tsx:
* `TaskList` is the display container for all tasks.
* `TaskDetailModal` displays when clicking on a task to edit or add a task.
* `TaskForm` was part of the modal, but ended up getting remade inside the modal component itself.

## AWS
### Backend
[Click here for pickup line](https://youtu.be/jk0gBZtTYUA?t=142)

The two services I will focus on are EC2 and S3. It's super easy to setup S3, so let's focus on something we'll definitly need to work first:

1. Navigate to EC2 and launch a new instance.
2. Name the EC2 whatever you'd like; preferably something related to the project (we'll call it 'django-tasks').
3. Select `Ubuntu` and leave everything to its default setting.
4. Create a new key pair and save it as a .pem. PUT IT IN A SAFE PLACE.
5. Network settings are set to default as well, where it will create a new security group.

Now that we have it created and running, we will need to connect to it and install the same information that we did on our local computer. Using terminal, you can enter this command:
```
ssh -i <name-of-key>.pem ubuntu@<ec2-public-address>
```

Start off using this command to allow OpenSSH on the server:
```
sudo ufw allow OpenSSH && sudo ufw enable
```

Now, let's use this command to install our essentials for Django to work:
```
sudo apt update && sudo apt install python3-pip python3-venv python3-dev libpq-dev postgresql postgresql-contrib nginx curl
```

To keep things organized, we'll create a directory for our project:
```
mkdir <project-name> && cd <project-name>
```

We will now create our virtual environment within this project folder:
```
python3 -m venv venv && source venv/bin/activate
```

Remember back when we did the local Django server and had to install these pip packages?:
```
pip install django djangorestframework gunicorn django-cors-headers
```
I added a couple for later.

Typically, you'd want your project version controlled so that it can be accessed securely for this process. But I didn't do this because it was simple enough to transfer via FTP and have the server made there using VIM.

If it is version-controlled, clone the repo using `git clone` and then work from there. But, for this, open your favorite FTP client. For me, it's `FileZilla`.

1. Open FileZilla.
2. Create a new site.
3. Fill in details:
* Username: ubuntu
* Host: Public IPV4
* Method: SFTP
4. Select .pem file as password.

Navigate to the project folder and drag/drop the entire Django project folder into it. Once that's done, you can safely disconnect.

Let's convert our database to postgresql before we continue to migrate. Then, we will add all of the necessary data so that we have a user with total control (RUN ONE COMMAND AT A TIME):
```
CREATE DATABASE taskmanager;
CREATE USER your_db_user WITH PASSWORD 'your_password';
ALTER ROLE your_db_user SET client_encoding TO 'utf8';
ALTER ROLE your_db_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE your_db_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE taskmanager TO your_db_user;
\q
```

Within the settings.py, it will have settings for databases but will be missing a couple of fields. Let's add them:
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

While we are in this file, let's define where our static files are going to be. This will be useful for our setup later.
Below the line `STATIC_URL`, let's add this section:
```
import os
STATIC_ROOT = os.path.join(BASE_URL, 'static/')
```

Then, run this command to see if it worked:
```
python manage.py collectstatic
```

It should also be safe now to execute `python manage.py migrate` or if you haven't yet, `python manage.py makemigrations`.

At this point, we could just run `python manage.py runserver` and call it a day. But I really wanted to use nginx and gunicorn for this setup.
So, what we do is run `deactivate` in the command line and start modifying files.

Let's use `sudo nano` to edit a file `/etc/systemd/system/gunicorn.socket`:
```
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
```

Then, let's `sudo nano` another file `/etc/systemd/system/gunicorn.service`:
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

Afterward, we need to activate this service by using the following commands:
```
sudo systemctl start gunicorn.socket && sudo systemctl enable gunicorn.socket
```

We should also double-check that the file exists by running `file /run/gunicorn.socket`.
Also, we need to check to see if the server is running with no error:
```
sudo systemctl status gunicorn && curl --unix-socket /run/gunicorn.sock localhost
```

It should return something like 'Not Found' or 'Resource not found'. If not, we need to run a command to see what's wrong:
```
sudo systemctl status gunicorn
```

Now the server should be running.
To eliminate the port number, nginx comes in handy.

Yet again, we'll need to `sudo nano` a file at `/etc/nginx/sites-available/djangotasks`:
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

To check and see if our syntax is correct, we'll run `sudo nginx -t` and then:
```
sudo systemctl restart nginx && sudo ufw allow 'Nginx Full'
```

If we head back to our browser and in our EC2, navigate to the security tab and click on our security group. Make sure our rules look like this:
![Screenshot 2024-07-19 105403](https://github.com/user-attachments/assets/e3a7da64-da84-4d1a-9209-21d40a75696f)
The bottom refers to the SSH from the terminal if you care about security.

Test the server to see if it works at `http://<public-ipv4>`

### Frontend
We simply go to our React project and run `npm run build`. Then on S3, we'll create a new S3 with a recognizable name, and uncheck `block public access`.
We can now upload everything inside the Build folder in our project, go to the properties tab, enable static hosting, and then go to the permissions tab to add this policy:
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

At this point, the frontend is live!

## Post Actions
Afterward, it's time to make sure everything works by accessing the static URL that S3 gives you once you have enabled static hosting. If there are errors, make sure you've entered everything correctly for those files we made for the backend and make sure you have given proper access to the ipv4.

An extra step, if you'd like, is to set up an elastic IP, where the IT doesn't change even if the server shuts down unexpectedly. It's as simple as going to EC2 and navigating to elastic IPs, then creating a new one with the EC2 instance selected. Then you'll be able to access the new IP on your browser and React app. Be sure to also log out of the terminal SSH so that you can re-enter the IP again, because that will change, too.

## DEMO
When accessing the site, you will be greeted by a small, boxed screen that resembles a list.
<br><img width="433" alt="Capture" src="https://github.com/user-attachments/assets/3666877d-e8a5-4dd1-88c5-dd45dee32992"><br>

When you click the plus sign at the bottom, you will be presented with a modal.
<br><img width="422" alt="Capture1" src="https://github.com/user-attachments/assets/0f0be2d6-eed8-479f-b7d8-3f3d5136d238"><br>

Once you've clicked save, you will see your new task on the board!
Afterward, you can click on the checkbox to complete a task, or the delete button to remove a task.
If you ever feel like you need to modify a task, clicking on the task itself will prompt you with another modal to edit the task or delete it.
<br><img width="402" alt="Capture3" src="https://github.com/user-attachments/assets/a1720cbd-5a00-4f80-a20e-f7330d6cff75"><br>


Also, an extra benefit of this application is that it's already modified to be used on mobile as well!
And, it has additional error-catching to notify you if the server is down.
<br><img width="441" alt="Capture4" src="https://github.com/user-attachments/assets/01420009-5820-411d-8846-3ac4467ab148"><br>