"""
URL configuration for NEAProjectBE project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from myapp.views import (
    LetterViewSet,
    ProductViewSet,
    OfficeViewSet,
    ReceiverViewSet,
    BranchViewSet,
    EmployeeViewSet,
    SeedDatabaseView,
)

router = DefaultRouter()
router.register('letters', LetterViewSet)
router.register('products', ProductViewSet)
router.register('offices', OfficeViewSet)
router.register('receivers', ReceiverViewSet)
router.register('branches', BranchViewSet)
router.register('employees', EmployeeViewSet)

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/token/', obtain_auth_token, name='api-token'),
    path('api/seed-database/', SeedDatabaseView.as_view(), name='seed-database'),
]
