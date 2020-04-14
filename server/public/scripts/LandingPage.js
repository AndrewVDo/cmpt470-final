
$(".upload-form").submit((event) => {
    event.preventDefault()
    let url = $(".upload-form").attr('action')
    let data = new FormData()
    let input = document.getElementById('file')
    data.append('file', input.files[0])
    let req = $.ajax({
        url: url,  
        type: 'POST',
        data: data,
        success: (data, textStatus, jqxhr) => {
            jqxhr.done((data) => {
                if(!data) {
                    console.error("No Response")
                    return
                }
            
                if(!data.success) {
                    alert(data.msg ? data.msg : 'No message')
                    return
                }
            
                window.location = $(location).attr('origin') + '/histogram'
            })
        },
        cache: false,
        contentType: false,
        processData: false
    })
})