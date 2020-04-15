$(".signout").click((event) => {
    event.preventDefault()
    let posting = $.post('/signout', {})
    posting.done((data) => {
        if(!data) {
            console.error("No Response")
            return
        }

        if(!data.success) {
            alert(data.msg ? data.msg : 'No message')
            return
        }

        window.location = $(location).attr('origin')
    })
})