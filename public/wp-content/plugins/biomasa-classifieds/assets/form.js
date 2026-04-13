// assets/form.js
jQuery(document).ready(function($) {
    // Update price based on options
    function updatePrice() {
        var accountOption = $('input[name="account_option"]:checked').val();
        var featured = $('#featured_checkbox').is(':checked');
        var isLoggedIn = $('#biomasa-ogloszenie-form').find('input[name="account_option"]').length === 0;
        
        var price = 0;
        var priceText = '';
        
        if (isLoggedIn) {
            price = 0;
            priceText = featured ? '18,45 PLN' : 'DARMOWE';
        } else {
            if (accountOption === 'with_account') {
                price = 0;
            } else {
                price = 24.59;
            }
            
            if (featured) {
                price += 18.45;
            }
            
            if (price === 0) {
                priceText = 'DARMOWE';
            } else {
                priceText = price.toFixed(2).replace('.', ',') + ' PLN';
            }
        }
        
        $('#submit-price').text(priceText);
    }
    
    // Account option change
    $('input[name="account_option"]').on('change', updatePrice);
    
    // Featured checkbox change
    $('#featured_checkbox').on('change', updatePrice);
    
    // Visual validation
    $('#biomasa-ogloszenie-form input[required], #biomasa-ogloszenie-form select[required], #biomasa-ogloszenie-form textarea[required]').on('blur', function() {
        if (!this.value.trim()) {
            $(this).addClass('error').css('border-color', '#dc3545');
        } else {
            $(this).removeClass('error').css('border-color', '#2d5c3f');
        }
    });

    $('#biomasa-ogloszenie-form input[required], #biomasa-ogloszenie-form select[required], #biomasa-ogloszenie-form textarea[required]').on('input change', function() {
        if (this.value.trim()) {
            $(this).removeClass('error').css('border-color', '#e0e0e0');
        }
    });
    
    // Form submission
    $('#biomasa-ogloszenie-form').on('submit', function(e) {
        e.preventDefault();
        
        var $form = $(this);
        var $submitBtn = $('.btn-submit');
        var $message = $('#form-message');
        
        // Validate required fields
        var hasError = false;
        $form.find('input[required], select[required], textarea[required]').each(function() {
            if (!this.value.trim()) {
                $(this).addClass('error').css('border-color', '#dc3545');
                hasError = true;
            }
        });
        
        if (hasError) {
            $message.html('Wypełnij wszystkie wymagane pola').addClass('error');
            return;
        }
        
        $submitBtn.prop('disabled', true);
        $message.html('Przetwarzanie...').removeClass('error success');
        
        // Execute reCAPTCHA
        grecaptcha.ready(function() {
            grecaptcha.execute(biomasaAjax.recaptcha_site_key, {action: 'submit_ogloszenie'}).then(function(token) {
                $('#recaptcha_token').val(token);
                
                var formData = new FormData($form[0]);
                formData.append('action', 'submit_ogloszenie');
                
                $.ajax({
                    url: biomasaAjax.ajaxurl,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        if (response.success) {
                            $message.html(response.data.message).addClass('success');
                            
                            if (response.data.needs_payment) {
                                setTimeout(function() {
                                    window.location.href = '?create_checkout_session=' + response.data.post_id;
                                }, 1500);
                            } else {
                                setTimeout(function() {
                                    window.location.href = '/';
                                }, 3000);
                            }
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
    
    // Initial price update
    updatePrice();
});