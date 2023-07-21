from django.db import models

# Create your models here.

class User(models.Model):
    """
    """
    username = models.CharField(max_length=200)

class Search(models.Model):
    """
    """
    date = models.DateTimeField("Search date")
    user = models.ForeignKey(User, on_delete=models.RESTRICT)
    