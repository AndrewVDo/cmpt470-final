$(".login-form").submit((event) => {
    event.preventDefault()
    let url = $(".login-form").attr('action')
    let posting = $.post(url, {
        username: $("#username").val(),
        password: $("#password").val()
    })
    posting.done((data) => {
        if(!data) {
            console.error("No Response")
            return
        }

        if(!data.success) {
            alert(data.msg ? data.msg : 'No message')
            return
        }

        window.location = $(location).attr('origin') + '/landing-page'
    })
})