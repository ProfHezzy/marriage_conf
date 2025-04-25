from django import forms

from django import forms
from django.core.validators import MinValueValidator, MaxValueValidator

class RegistrationForm(forms.Form):
    full_name = forms.CharField(
        label='Full Name',
        max_length=100,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your full name',
        }),
        error_messages={
            'required': 'Please enter your full name',
        }
    )
    
    email = forms.EmailField(
        label='Email Address',
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'your@email.com',
        })
    )
    
    phone = forms.CharField(
        label='Phone Number',
        max_length=15,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '+1234567890',
        }),
        required=False
    )
    
    marital_status = forms.ChoiceField(
        label='Marital Status',
        choices=[
            ('', 'Select your status'),
            ('single', 'Single'),
            ('engaged', 'Engaged'),
            ('married', 'Married'),
        ],
        widget=forms.Select(attrs={
            'class': 'form-select',
            'name' : 'marital_status',
            'id' : 'marital_status',
        })
    )
    
    age = forms.IntegerField(
        label='Age',
        validators=[
            MinValueValidator(18, message="You must be at least 18 years old"),
            MaxValueValidator(120, message="Please enter a valid age")
        ],
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'min': '18',
            'max': '120',
            'placeholder': 'Your age',
        })
    )
    
    country = forms.CharField(
        label='Country of Residence',
        max_length=100,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Your country',
        })
    )
    
    attendance_mode = forms.ChoiceField(
        label='Attendance Mode',
        choices=[
            ('', 'Select preferred mode'),
            ('online', 'Online'),
            ('in_person', 'In Person'),
        ],
        widget=forms.Select(attrs={
            'class': 'form-select',
        })
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add form-control class to all fields automatically
        for field_name, field in self.fields.items():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'
            field.widget.attrs['style'] = 'border-color: var(--brand-purple);'