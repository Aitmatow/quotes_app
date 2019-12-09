const baseUrl = 'http://localhost:8000/api/v1/';

function getFullPath(path) {
    path = path.replace(/^\/+|\/+$/g, '');
    path = path.replace(/\/{2,}/g, '/');
    return baseUrl + path + '/';
}

function makeRequest(path, method, auth=true, data=null) {
    let settings = {
        url: getFullPath(path),
        method: method,
        dataType: 'json'
    };
    if (data) {
        settings['data'] = JSON.stringify(data);
        settings['contentType'] = 'application/json';
    }
    if (auth) {
        settings.headers = {'Authorization': 'Token ' + getToken()};
    }
    return $.ajax(settings);
}

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

function removeToken() {
    localStorage.removeItem('authToken');
}

function logIn(username, password) {
    const credentials = {username, password};
    let request = makeRequest('login', 'post', false, credentials);
    request.done(function(data, status, response) {
        console.log('Received token');
        saveToken(data.token);
        formModal.modal('hide');
        enterLink.addClass('d-none');
        exitLink.removeClass('d-none');
    }).fail(function(response, status, message) {
        console.log('Could not get token');
        console.log(response.responseText);
    });
}
function logOut() {
    let request = makeRequest('logout', 'post', true);
    request.done(function(data, status, response) {
        console.log('Cleaned token');
        removeToken();
        enterLink.removeClass('d-none');
        exitLink.addClass('d-none');
    }).fail(function(response, status, message) {
        console.log('Could not clean token');
        console.log(response.responseText);
    });
}

let logInForm, quoteForm, quoteEditForm, homeLink, enterLink, createLink, exitLink, formSubmit, formTitle, content, formModal,
    usernameInput, passwordInput, authorInput, textInput,textInputEdit, statusEdit, ratingEdit, emailInput;


function setUpGlobalVars() {
    logInForm = $('#log_in_form');
    quoteForm = $('#quote_form');
    quoteEditForm = $('#quote_edit_form');
    homeLink = $('#home_link');
    enterLink = $('#enter_link');
    createLink = $('#create_link');
    exitLink = $('#exit_link');
    formSubmit = $('#form_submit');
    formTitle = $('#form_title');
    content = $('#content');
    formModal = $('#form_modal');
    usernameInput = $('#username_input');
    passwordInput = $('#password_input');
    authorInput = $('#author_input');
    textInput = $('#text_input');
    textInputEdit = $('#text_input_edit');
    statusEdit = $('#status_input');
    ratingEdit = $('#rating_input');
    emailInput = $('#email_input');
}



function setUpAuth() {
    logInForm.on('submit', function(event) {
        event.preventDefault();
        logIn(usernameInput.val(), passwordInput.val());
    });

    enterLink.on('click', function(event) {
        event.preventDefault();
        logInForm.removeClass('d-none');
        quoteForm.addClass('d-none');
        quoteEditForm.addClass('d-none');
        formTitle.text('Войти');
        formSubmit.text('Войти');
        formSubmit.off('click');
        formSubmit.on('click', function(event) {
            logInForm.submit();
        });
    });

    exitLink.on('click', function(event) {
        event.preventDefault();
        logOut();
    });
}

function setUpNewQuote() {
    quoteForm.on('submit', function(event) {
        event.preventDefault();
        createQuote(authorInput.val(), textInput.val(), emailInput.val());
        getQuotes();
    });

    createLink.on('click', function(event) {
        event.preventDefault();
        logInForm.addClass('d-none');
        quoteForm.removeClass('d-none');
        quoteEditForm.addClass('d-none');
        formTitle.text('Добавление');
        formSubmit.text('Создать');
        formSubmit.off('click');
        formSubmit.on('click', function(event) {
            quoteForm.submit();
        });
    });
}

function checkAuth() {
    let token = getToken();
    if(token) {
        enterLink.addClass('d-none');
        exitLink.removeClass('d-none');
    } else {
        enterLink.removeClass('d-none');
        exitLink.addClass('d-none');
    }
}

function createQuote(text, author_name, author_email) {
    const credentials = {text, author_name, author_email};
    let request = makeRequest('quote', 'post', false, credentials);
    request.done(function (data, status, response) {
        console.log('Цитата добавлена');
        formModal.modal('hide');
    }).fail(function(response, status, message) {
        console.log('Could not add quote');
        console.log(response.responseText);
    });
}

function editQuote(id, text, status, rating) {
    const credentials = {text, status, rating};
    let request = makeRequest('quote/' + id, 'patch', true, credentials);
    request.done(function (data, status, response) {
        console.log('Цитата обновлена!');
        formModal.modal('hide');
        getQuotes();
    }).fail(function(response, status, message) {
        console.log('Could not edit quote');
        console.log(response.responseText);
    });
}

function delQuote(id) {
    let request = makeRequest('quote/' + id, 'delete', true);
    request.done(function (data, status, response) {
        console.log('Цитата удалена');
        getQuotes();
    }).fail(function(response, status, message) {
        console.log('Could not delete quote');
        console.log(response.responseText);
    });
}

function rateUp(id) {
    let request = makeRequest('quote/' + id + '/rate_up', 'post', false);
    request.done(function(data, status, response) {
        console.log('Rated up quote with id ' + id + '.');
        $('#rating_' + id).text(data.rating);
    }).fail(function(response, status, message) {
        console.log('Could not rate up quote with id ' + id + '.');
        console.log(response.responseText);
    });
}

function rateDown(id) {
    let request = makeRequest('quote/' + id + '/rate_down', 'post', false);
    request.done(function(data, status, response) {
        console.log('Rated down quote with id ' + id + '.');
        $('#rating_' + id).text(data.rating);
    }).fail(function(response, status, message) {
        console.log('Could not rate down quote with id ' + id + '.');
        console.log(response.responseText);
    });
}

function getDetailQuote(id) {
    let request = makeRequest('quote/' + id , 'get', true);
    let last_content = content;
    request.done(function (data, status, response) {
        console.log('Информация получена!');
        content.empty();
        content.append($(`<div class="card text-center" id="quote_${data.id}">
                            <div class="card-header">
                            Featured
                            </div>
                             
                          <p>${data.text}</p>
                          <label>Рейтинг:<p id="rating_${data.id}">${data.rating}</p> </label>                          
                          <div class="card-footer"><a href="#" class="btn btn-primary" id="go_back">Back</a></div>
                            </div>`));
        $('#go_back').on('click', function (event) {
            event.preventDefault();
            getQuotes();
        })
    }).fail(function(response, status, message) {
        console.log('Could not rate down quote with id ' + id + '.');
        console.log(response.responseText);
    });
}

function getQuotes() {
    let request = makeRequest('quote', 'get', false);
    request.done(function(data, status, response) {
        console.log(data);
        content.empty();
        data.forEach(function(item, index, array) {
            content.append($(`
                <div class="card text-center" id="quote_${item.id}">
                  <div class="card-header"> 
                    Очередная цитата...
                  </div>
                  <div class="card-body">
                    <p>${item.text}</p>
                    <label>Рейтинг:<p id="rating_${item.id}">${item.rating}</p> </label>
                    <p><a href="#" class="btn btn-success" id="rate_up_${item.id}">+</a>
                    <a href="#" class="btn btn-danger" id="rate_down_${item.id}">-</a></p>                    
                  </div>
                  <div class="card-footer text-muted">                                       
                    <p>
                    <a href="#" class="btn btn-primary" id="detail_quote_${item.id}">Detail</a>
                    <a href="#" class="btn btn-primary" id="edit_quote_${item.id}" data-toggle="modal" data-target="#form_modal">Edit</a>
                    <a href="#" class="btn btn-danger" id="delete_quote_${item.id}">Delete</a>
                    </p>
                  </div>
                </div>`));
            $('#rate_up_' + item.id).on('click', function(event) {
                console.log('click');
                event.preventDefault();
                rateUp(item.id);
            });
            $('#rate_down_' + item.id).on('click', function(event) {
                console.log('click');
                event.preventDefault();
                rateDown(item.id);
            });
            $('#delete_quote_' + item.id).on('click', function(event) {
                console.log('click');
                event.preventDefault();
                delQuote(item.id);
            });
            $('#detail_quote_' + item.id).on('click', function(event) {
                console.log('click');
                event.preventDefault();
                getDetailQuote(item.id);
            });
            $('#edit_quote_' + item.id).on('click', function(event) {
                event.preventDefault();
                textInputEdit.val(item.text);
                statusEdit.add(`<option>${item.status}</option>`);
                ratingEdit.val(item.rating);
                logInForm.addClass('d-none');
                quoteForm.addClass('d-none');
                quoteEditForm.removeClass('d-none');
                formTitle.text('Редактирование');
                formSubmit.text('Редактирование');
                formSubmit.off('click');
                formSubmit.on('click', function(event) {
                    quoteEditForm.on('submit', function(event) {
                    editQuote(item.id, textInputEdit.val(), statusEdit.val(), ratingEdit.val());
                    });
                    quoteEditForm.submit();
                });
            });
        });
    }).fail(function(response, status, message) {
        console.log('Could not get quotes.');
        console.log(response.responseText);
    });
}

$(document).ready(function() {
    setUpGlobalVars();
    setUpAuth();
    checkAuth();
    getQuotes();
    setUpNewQuote();
});
