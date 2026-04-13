// assets/register.js
jQuery(document).ready(function($) {
    $('#biomasa-registration-form').on('submit', function(e) {
        e.preventDefault();
        
        var $form = $(this);
        var $submitBtn = $('.btn-register');
        var $message = $('#register-message');
        
        $submitBtn.prop('disabled', true);
        $message.html('Przetwarzanie...').removeClass('error success');
        
        grecaptcha.ready(function() {
            grecaptcha.execute(biomasaRegister.recaptcha_site_key, {action: 'register'}).then(function(token) {
                $('#recaptcha_token').val(token);
                
                var formData = $form.serialize();
                formData += '&action=register_user';
                
                $.ajax({
                    url: biomasaRegister.ajaxurl,
                    type: 'POST',
                    data: formData,
                    success: function(response) {
                        if (response.success) {
                            $message.html(response.data).addClass('success');
                            $form[0].reset();
                        } else {
                            $message.html(response.data).addClass('error');
                            $submitBtn.prop('disabled', false);
                        }
                    },
                    error: function() {
                        $message.html('Wystąpił błąd. Spróbuj ponownie.').addClass('error');
                        $submitBtn.prop('disabled', false);
                    }
                });
            });
        });
    });
});