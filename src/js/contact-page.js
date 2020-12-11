(function() {
  const errorCodeRegex = /^CID\d{4}$/;
  const MISSING_NAME_ERROR = 'Enter your full name';
  const MISSING_EMAIL_ERROR = 'Enter your email address';
  const INVALID_EMAIL_ERROR = 'Enter an email address in the correct format, like name@example.com';
  const MISSING_MESSAGE_ERROR = 'Enter your message';
  const MISSING_CLIENT_ERROR = 'Select the website or app you are trying to visit';
  const REQUEST_HEADERS = new Headers({
    'Content-type': 'application/json',
  });

  const validateEmailField = Validators.combineValidators([
    Validators.hasValue('email', MISSING_EMAIL_ERROR),
    Validators.validEmail('email', INVALID_EMAIL_ERROR),
  ]);

  FormBuilder('contact-us-form')
    .addFormControl('name-form-control', Validators.hasValue('name', MISSING_NAME_ERROR))
    .addFormControl('email-form-control', validateEmailField)
    .addFormControl('client-form-control', Validators.hasValue('client', MISSING_CLIENT_ERROR))
    .addFormControl('message-form-control', Validators.hasValue('message', MISSING_MESSAGE_ERROR))
    .addSuccessHandler(onSubmit);

  function getAccountId() {
    const { account_id = '' } = Utils.getJWTCookie('id_token') || {};
    return account_id;
  }

  function getErrorCode() {
    const errorCode = Utils.getParam('error');
    const errorDesc = Utils.getParam('desc');
    if (errorCodeRegex.test(errorCode)) {
      const errorMatch = ContactUsLinks.find(x => x.code == errorCode);
      if (errorMatch) {
        return errorMatch;
      }
      if (!errorMatch) {
        return (
          { code: errorCode, description: errorDesc } || { code: 'UNKNOWN', description: 'UNKNOWN' }
        );
      }
    } else {
      return { code: 'UNKNOWN', description: 'UNKNOWN' };
    }
  }

  function sendSupportEmail(formData) {
    const account_id = getAccountId();
    const { code, description } = getErrorCode();
    const body = {
      user_name: formData.get('name'),
      user_email: formData.get('email'),
      user_id: account_id,
      client: formData.get('client'),
      error_code: code,
      error_title: description,
      error_description: description,
      message: formData.get('message'),
      browser: navigator.userAgent,
    };

    return fetch(Environment.EMAIL_API_URL, {
      method: 'POST',
      headers: REQUEST_HEADERS,
      body: JSON.stringify(body),
    });
  }

  function onSubmit(formData) {
    sendSupportEmail(formData)
      .then(res => {
        const nextPage = res.ok ? '/contact-sent' : '/contact-error';
        window.location.assign(nextPage);
      })
      .catch(() => window.location.assign('/contact-error'));
  }
})();
