// Authentication guard - redirect to login if not authenticated
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'weblogin.html';
}
