# from django import template
from django.shortcuts import render
from django.http import HttpResponse
# from selenium import webdriver
# from urllib.request import urlopen
# import requests
# import pandas as pd
# from bs4 import BeautifulSoup
# from django.template import loader
from django.conf import settings
from django.shortcuts import redirect
# from django.urls import reverse
from django.http import JsonResponse

# Create your views here.

def index(request):
    """
    """

    context = {
        "settings": settings
    }
    return render(request, "profileviewer/index.html", context)


def throwError(request, codeError):
    """
    """
    
    context = {
        "settings": settings,
        "params": request.POST
    }

    if codeError is None:
        error_page = "profileviewer/error_pages/error.html"
    else:
        error_page = "profileviewer/error_pages/error_404.html"

    return render(request, error_page, context)


def checkInputURL(request, linkURL):
    """
    """

    linkRootURL = "linkedin.com/in/"

    # throwing an error 404 when it's not a linkedin page
    if linkRootURL not in linkURL:
        return throwError(request, 404)


def profileViewerPage(request):
    """
    """

    # prevent access to this resource directly
    if request.method == "GET":
        return redirect('/')

    # if the request's method is post 
    params = request.POST
    linkURL = params.get("linkURL")

    checkResult = checkInputURL(request, linkURL)
    if checkResult is not None:
        return checkResult

    # using the session framework to store data
    request.session["profileURL"] = linkURL

    context = {
        "settings": settings,
        "params": request.POST
    }
    return render(request, "profileviewer/viewer.html", context)


def profileViewerApi(request):
    """
    """

    linkURL = request.session.get("profileURL", None)

    if linkURL is None:
        throwError(request)

    profileData = {}

    return JsonResponse(profileData, safe=False)