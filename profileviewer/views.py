from django import template
from django.shortcuts import render
from django.http import HttpResponse
from selenium import webdriver
# from urllib.request import urlopen
import requests
import pandas as pd
from bs4 import BeautifulSoup
# from django.template import loader
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
import time

# Create your views here.

def index(request):
    """
    """

    context = {
        "settings": settings
    }
    return render(request, "profileviewer/index.html", context)

def profileViewer(request):
    """
    """

    # url = "https://bj.linkedin.com/in/c%C3%A9dric-amoussou-97a901143"
    # page = requests.get(url)
    # # html = page.read().decode("utf-8")
    # soup = BeautifulSoup(page.content, "html.parser")
    # print(soup.prettify())

    # prevent access to this resource directly
    if request.method == "GET":
        return redirect('/')

    # if the request's method is post 
    params = request.POST
    linkURL = params.get("linkURL")

    # driver = webdriver.Chrome("/snap/bin/chromium.chromedriver")
    driver = webdriver.Chrome("/usr/bin/chromedriver")
    driver.get(linkURL)

    # waiting for the entire page to load
    # time.sleep(7)

    start = time.time()
     
    # will be used in the while loop
    initialScroll = 0
    finalScroll = 1000
     
    while True:
        driver.execute_script(f"window.scrollTo({initialScroll},{finalScroll})")
        # this command scrolls the window starting from
        # the pixel value stored in the initialScroll
        # variable to the pixel value stored at the
        # finalScroll variable
        initialScroll = finalScroll
        finalScroll += 1000
     
        # we will stop the script for 3 seconds so that
        # the data can load
        time.sleep(3)
        # You can change it as per your needs and internet speed
     
        end = time.time()
     
        # We will scroll for 20 seconds.
        # You can change it as per your needs and internet speed
        if round(end - start) > 20:
            break
    

    context = {
        "settings": settings
    }
    return render(request, "profileviewer/viewer.html", context)
