from django.http import JsonResponse
from django.shortcuts import render, redirect
from .forms import RegistrationForm
from .models import Registration
from django.contrib import messages
from django.core.mail import send_mail, mail_admins
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging
from django.core.mail import EmailMessage
from django.template import Context
from django.utils.safestring import mark_safe
#import plain message


logger = logging.getLogger(__name__)

def user_confirmation(request):
    return render(request, 'event/user_confirmation.html')

def send_confirmation_email(user, request):
    try:
        subject = "Your Registration Confirmation"
        
        # Render both HTML and plain text versions
        html_message = render_to_string('event/user_confirmation.html', {
            'user': user,
            'domain': request.get_host()
        })
        plain_message = strip_tags(html_message)  # Create text version from HTML
        
        send_mail(
            subject=subject,
            message=plain_message,  # Text version
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,  # HTML version
            fail_silently=False
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send user confirmation to {user.email}: {str(e)}")
        return False
    
    

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            try:
                # Save to database
                registration = Registration.objects.create(
                    full_name=data['full_name'],
                    email=data['email'],
                    phone=data.get('phone', ''),
                    marital_status=data['marital_status'],
                    age=data['age'],
                    country=data['country'],
                    attendance_mode=data['attendance_mode'],
                )

                # Notify Admins
                admin_subject = f"New Registration: {registration.full_name}"
                admin_html_message = render_to_string('event/admin_notification.html', {
                    'data': data,
                    'domain': request.get_host()
                })
                mail_admins(
                    subject=admin_subject,
                    message=strip_tags(admin_html_message),
                    html_message=admin_html_message,
                    fail_silently=False,
                )

                # Send confirmation to user
                send_confirmation_email(registration, request)

                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True,
                        'redirect_url': '/user_confirmation/',
                        'message': 'Registration successful!'
                    })
                else:
                    messages.success(request, "Registration successful!")
                    return redirect('user_confirmation')

            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({'success': False, 'message': 'An error occurred.'}, status=500)
                else:
                    messages.error(request, "An error occurred.")
                    return render(request, 'event/landing.html', {'form': form})

        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': form.errors}, status=400)
            else:
                return render(request, 'event/landing.html', {'form': form})

    else:
        form = RegistrationForm()
        return render(request, 'event/landing.html', {'form': form})

def landing_page(request):
    form = RegistrationForm()
    return render(request, 'event/landing.html', {'form': form})