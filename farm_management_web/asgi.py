"""
ASGI config for farm_management_web project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
# from django.core.asgi import get_asgi_application
# django_asgi_app = get_asgi_application()

os.environ['DJANGO_SETTINGS_MODULE'] = 'farm_management_web.settings'

import django
django.setup()

from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()


from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from .routing import application as websocket_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'farm_management_web.settings')

application = ProtocolTypeRouter({
    # "http": AsgiHandler(),
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_application  
        )
    ),
})


