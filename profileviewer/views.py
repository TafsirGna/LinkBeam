# from django import template
from django.shortcuts import render
from django.http import HttpResponse
from selenium import webdriver
# from urllib.request import urlopen
# import requests
# import pandas as pd
from bs4 import BeautifulSoup
# from django.template import loader
from django.conf import settings
from django.shortcuts import redirect
# from django.urls import reverse
from django.http import JsonResponse
import time

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

    driver = webdriver.Chrome("/usr/bin/chromedriver")
    driver.get(linkURL)

    # waiting for the entire page to load
    time.sleep(30)

    # start = time.time()
     
    # # will be used in the while loop
    # initialScroll = 0
    # finalScroll = 1000
     
    # while True:
    #     driver.execute_script(f"window.scrollTo({initialScroll},{finalScroll})")
    #     # this command scrolls the window starting from
    #     # the pixel value stored in the initialScroll
    #     # variable to the pixel value stored at the
    #     # finalScroll variable
    #     initialScroll = finalScroll
    #     finalScroll += 1000
     
    #     # we will stop the script for 3 seconds so that
    #     # the data can load
    #     time.sleep(3)
    #     # You can change it as per your needs and internet speed
     
    #     end = time.time()
     
    #     # We will scroll for 20 seconds.
    #     # You can change it as per your needs and internet speed
    #     if round(end - start) > 20:
    #         break


    src = driver.page_source
 
    # Now using beautiful soup
    # soup = BeautifulSoup(src, 'lxml')
    soup = BeautifulSoup(src, 'html.parser')

    join_form = soup.find('form', {'class': 'join-form'})
 
    print(join_form)
    print("------------")
    print(soup)

    return JsonResponse(profileData, safe=False)