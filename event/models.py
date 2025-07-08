from django.db import models

class Registration(models.Model):
    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('engaged', 'Engaged'),
        ('married', 'Married'),
    ]

    ATTENDANCE_MODE_CHOICES = [
        ('online', 'Online'),
        ('in_person', 'In Person'),
    ]

    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True)
    marital_status = models.CharField(max_length=10, choices=MARITAL_STATUS_CHOICES)
    age = models.PositiveIntegerField()
    country = models.CharField(max_length=100)
    attendance_mode = models.CharField(max_length=10, choices=ATTENDANCE_MODE_CHOICES)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name
