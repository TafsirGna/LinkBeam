from django import template
from django.shortcuts import render
from django.http import HttpResponse
from selenium import webdriver
# from urllib.request import urlopen
import requests
import pandas as pd
from bs4 import BeautifulSoup
# from django.template import loader

# Create your views here.

def index(request):
    """
    """

    context = {}
    return render(request, "profileviewer/index.html", context)
    # return HttpResponse("")

def profileViewer(request):
    """
    """

    # url = "https://bj.linkedin.com/in/c%C3%A9dric-amoussou-97a901143"
    # page = requests.get(url)
    # # html = page.read().decode("utf-8")
    # soup = BeautifulSoup(page.content, "html.parser")
    # print(soup.prettify())

    driver = webdriver.Chrome("/snap/bin/chromium.chromedriver")
    driver.get("www.google.com")

    context = {}
    return render(request, "profileviewer/viewer.html", context)
