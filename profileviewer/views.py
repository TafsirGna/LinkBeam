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
        return redirect('index')t

    # driver = webdriver.Chrome("/snap/bin/chromium.chromedriver")
    driver = webdriver.Chrome("/usr/bin/chromedriver")
    driver.get("https://www.google.com")

    context = {
        "settings": settings
    }
    return render(request, "profileviewer/viewer.html", context)
