function loadGroup(id, userId) {
    newGroup = (id <= 0);

    //$('#right-panel').removeClass('col-md-2');
    //$('#right-panel').addClass('col-md-2');
    $('#right-panel').hide();
    $('#user-details-panel').hide();
    $('#group-details-panel').show();

    $('#group-details-panel').load(getUrl('usermanagement/groupdetails/' + id + '/' + userId), function () {
        initializeGroup();
    });

}

function initializeGroup() {

    var height = $(window).height() - 200;

    $('#group-access-tree').height(height);
    $('#Name').select();
    $('#Name').focus();

    $("#group-form").validate({
        rules: {
            Name: {
                required: true,
                maxlength: 250
            },
            Description: {
                maxlength: 500
            }
        },
        messages: {
            Name: {
                required: "Name is a required field",
                maxlength: "Name can not be longer than 250 characters"
            },
            Description: {
                maxlength: "Description can not be longer than 500 characters"
            }
        }
    });


    $('#group-access-tree > li > div:first-child > span:first-child').click(function () {
        var children = $(this).closest('li').find('ul');

        if (children.is(':visible')) {
            children.fadeOut(200);
            $(this).children('img').attr('src', getUrl('Content/Images/tree-arrow-collasped.png'));
        }
        else {
            children.fadeIn(200);
            $(this).children('img').attr('src', getUrl('Content/Images/tree-arrow-expanded.png'));
        }
    });

    $('#group-access-tree > li > div:first-child .role-select').click(function () {
        $(this)
            .closest('li')
            .find('.role-select[data-action=' + $(this).attr('data-action') + ']')
            .not(':disabled')
            .prop('checked', $(this).is(':checked'))
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'));

        if ($(this).attr('data-action') == 'create' && $(this).is(':checked')) {
            $(this)
            .closest('li')
            .find('.role-select[data-action=modify]')
            .prop('checked', $(this).is(':checked'))
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'));
        }
        else if ($(this).attr('data-action') == 'create' && !$(this).is(':checked')) {
            $(this)
            .closest('li')
            .find('.role-select[data-action=delete]')
            .prop('checked', false)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .find('input[type=checkbox]')

            $(this)
            .closest('li')
            .find('.role-select[data-action=modify]')
            .removeAttr('disabled');
        }

        if ($(this).attr('data-action') == 'delete' && $(this).is(':checked')) {
            $(this)
            .closest('li')
            .find('.role-select[data-action=modify]')
            .prop('checked', $(this).is(':checked'))
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .find('input[type=checkbox]');

            $(this)
            .closest('li')
            .find('.role-select[data-action=create]')
            .prop('checked', $(this).is(':checked'))
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .find('input[type=checkbox]');
        }
        else if ($(this).attr('data-action') == 'delete' && !$(this).is(':checked')) {
            $(this)
            .closest('li')
            .find('.role-select[data-action=create]')
            .removeAttr('disabled');
        }

        if ($(this).attr('data-action') == 'modify' && !$(this).is(':checked')) {
            $(this)
            .closest('li')
            .find('.role-select[data-action=create]')
            .prop('checked', $(this).is(':checked'))
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .find('input[type=checkbox]');

            $(this)
            .closest('li')
            .find('.role-select[data-action=delete]')
            .prop('checked', $(this).is(':checked'))
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .find('input[type=checkbox]');
        }
    });

    $('#group-access-tree > li ul .role-select').click(function () {
        if ($(this).attr('data-action') == 'create' && $(this).is(':checked')) {
            $(this)
            .parent()
            .prev()
            .children('input.role-select[data-action=modify]')
            .prop('checked', true)
            .closest('span')
            .toggleClass('selected', true);
        }
        else if ($(this).attr('data-action') == 'create' && !$(this).is(':checked')) {
            $(this)
            .parent()
            .next()
            .children('input.role-select[data-action=delete]')
            .prop('checked', false)
            .closest('span')
            .toggleClass('selected', false);

            $(this)
            .parent()
            .prev()
            .children('input.role-select[data-action=modify]')
            .removeAttr('disabled');
        }

        if ($(this).attr('data-action') == 'delete' && $(this).is(':checked')) {
            $(this)
            .parent()
            .prev()
            .children('input.role-select[data-action=create]')
            .prop('checked', true)
            .closest('span')
            .toggleClass('selected', true);

            $(this)
            .parent()
            .prev()
            .prev()
            .children('input.role-select[data-action=modify]')
            .prop('checked', true)
            .closest('span')
            .toggleClass('selected', true);
        }
        else if ($(this).attr('data-action') == 'delete' && !$(this).is(':checked')) {
            $(this)
            .parent()
            .prev()
            .children('input.role-select[data-action=create]')
            .removeAttr('disabled');
        }
        if ($(this).attr('data-action') == 'modify' && !$(this).is(':checked')) {
            $(this)
            .parent()
            .next()
            .children('input.role-select[data-action=create]')
            .prop('checked', false)
            .closest('span')
            .toggleClass('selected', false);

            $(this)
            .parent()
            .next()
            .next()
            .children('input.role-select[data-action=delete]')
            .prop('checked', false)
            .closest('span')
            .toggleClass('selected', false);
        }

        var allSelected = $(this).closest('ul').find('.role-select[data-action=' + $(this).attr('data-action') + ']').not(':checked').size() == 0;
        //var allModifyNotDisabled = $(this).closest('ul').find('.role-select[data-action=modify]').not(':disabled').size() == $(this).closest('ul').find('.role-select[data-action=modify]').size();
        //var allModifyDisabled = $(this).closest('ul').find('.role-select[data-action=modify]').not(':disabled').size() == 0;
        var allModifySelected = $(this).closest('ul').find('.role-select[data-action=modify]').not(':checked').size() == 0;
        //var allCreateNotDisabled = $(this).closest('ul').find('.role-select[data-action=create]').not(':disabled').size() == $(this).closest('ul').find('.role-select[data-action=create]').size();
        //var allCreateDisabled = $(this).closest('ul').find('.role-select[data-action=create]').not(':disabled').size() == 0;
        var allCreateSelected = $(this).closest('ul').find('.role-select[data-action=create]').not(':checked').size() == 0;
        var allDeleteSelected = $(this).closest('ul').find('.role-select[data-action=delete]').not(':checked').size() == 0;

        $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=' + $(this).attr('data-action') + ']')
            .prop('checked', allSelected)
            .closest('span')
            .toggleClass('selected', allSelected);

        if ($(this).attr('data-action') == 'create' && $(this).is(':checked')) {
            $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=modify]')
            .prop('checked', allModifySelected)
            .closest('span')
            .toggleClass('selected', allModifySelected);
        }
        else if ($(this).attr('data-action') == 'create' && !$(this).is(':checked')) {
            $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=delete]')
            .prop('checked', allDeleteSelected)
            .closest('span')
            .toggleClass('selected', allDeleteSelected);

            $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=modify]')
            .removeAttr('disabled')
            .prop('checked', allModifySelected)
            .closest('span')
            .toggleClass('selected', allModifySelected)
        }

        if ($(this).attr('data-action') == 'delete' && $(this).is(':checked')) {
            $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=modify]')
            .prop('checked', allModifySelected)
            .closest('span')
            .toggleClass('selected', allModifySelected);

            $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=create]')
            .prop('checked', allCreateSelected)
            .closest('span')
            .toggleClass('selected', allCreateSelected);
        }
        else if ($(this).attr('data-action') == 'delete' && !$(this).is(':checked')) {
            $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=create]')
            .removeAttr('disabled');
        }
        if ($(this).attr('data-action') == 'modify' && !$(this).is(':checked')) {
            $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=create]')
            .prop('checked', allCreateSelected)
            .closest('span')
            .toggleClass('selected', allCreateSelected);

            $(this)
            .closest('span')
            .toggleClass('selected', $(this).is(':checked'))
            .closest('ul')
            .closest('li')
            .children('div:first-child')
            .children('span')
            .children('input.role-select[data-action=delete]')
            .prop('checked', allDeleteSelected)
            .closest('span')
            .toggleClass('selected', allDeleteSelected);
        }
    });

    function markGroupDirty() {
        $('#save-group').removeAttr('disabled');
        $('#save-successful').fadeOut(200);
    }

    $('input[type=text],textarea').keypress(function (e) {
        if (e.which !== 0) {
            markGroupDirty();
        }
    });

    $('input[type=text],textarea').keyup(function (e) {
        if (e.which == 8) {
            markGroupDirty();
        }
    });

    $('.role-select').change(function () {
        markGroupDirty();
    });

    $('input[type=text]').bind('paste', function () {
        markGroupDirty();
    });

    $('#Name').change(function () {
        groupNameChanged = true;
        if ($('#Name').val().length > 35) {
            $('#title-group-name').text($('#Name').val().substring(0, 35) + '...');
        }
        else {
            $('#title-group-name').text($('#Name').val());
        }
    });

    $('#save-group').click(function () {

        $('#save-group').attr('disabled', 'disabled');

        if (!$('#group-form').valid()) {
            $('#validation-container').slideDown();
            $('#save-group').removeAttr('disabled');
            return;
        }

        var roles = new Array();

        $('#group-access-tree > li > div > ul > li .role-select:checked').each(function () {
            var role = new Object();
            role.ID = $(this).attr('data-roleID');
            roles.push(role);
        });
        trimWhiteSpaces($('#Name'));
        trimWhiteSpaces($('#Description'));
        var data = {
            ID: $('#group-details').attr('data-id'),
            Name: $('#Name').val(),
            Description: $('#Description').val(),
            UserId: $('#group-details').attr('data-user-id'),
            Roles: roles
        };

        $.ajax({
            type: "POST",
            url: getUrl("usermanagement/save-group"),
            contentType: 'application/json; charset=utf-8',
            traditional: true,
            data: JSON.stringify(data),
            success: function (result) {
                if (result.Successful) {
                    $('#save-group').attr('disabled', 'disabled');
                    toastr.success('Group details have been saved.');
                    $('#save-group').removeAttr('disabled');
                    $('#reload-page').click();

                } else {
                    toastr.error(result.Errors);
                }

            }
        });
    });

    $('#cancel-group').click(function () {
        var id = $('#group-details').attr('data-id');
        var userId = $('#group-details').attr('data-user-id');

        if (id > 0) {
            loadGroup(id, userId);
        }
        else {
            $('#reload-page').click();
        }
    });

    $('#delete-group').click(deleteGroup);

    setCheckboxDisabled();

    $('#add-user-group').click(function () {
        loadGroup(0);
    });

    $('#delete-group-cancel').click(function () {
        $('#delete-group-confirm').fadeOut();
    });

    $('#delete-group-ok').click(deleteGroupConfirm);
}

function deleteGroup() {
    if ($(this).attr('data-has-users') != 'False') {
        toastr.error('You cannot delete a group which has users');
        return false;
    }

    $('#delete-group-confirm').show();
    return false;
}

function deleteGroupConfirm() {
    $('#delete-group-confirm').fadeOut();

    var data = {
        GroupID: $('#group-details').attr('data-id')
    };

    $.post(getUrl("usermanagement/delete-group"), data, function (result) {
        if (result.Successful) {
            toastr.success('Group was deleted successfully');
            $('#reload-page').click();
        }
    });
}

function setCheckboxDisabled() {
    $.each($('.role-select'), function (index, div) {
        if ($(this).attr('data-action') == 'delete') {
            if ($(this).is(':checked')) {
                $(this).parent().prev().find('.role-select[data-action=create]').attr('disabled', true);
                $(this).parent().prev().prev().find('.role-select[data-action=modify]').attr('disabled', true);
                $(this)
                .closest('span')
                .closest('ul')
                .closest('li')
                .children('div:first-child')
                .children('span')
                .children('input.role-select[data-action=create]')
                .attr('disabled', true);
            }
        }
    });

    $.each($('.role-select'), function (index, div) {
        if ($(this).attr('data-action') == 'create') {
            if ($(this).is(':checked')) {
                $(this).parent().prev().find('.role-select[data-action=modify]').attr('disabled', true);
                $(this)
                .closest('span')
                .closest('ul')
                .closest('li')
                .children('div:first-child')
                .children('span')
                .children('input.role-select[data-action=modify]')
                .attr('disabled', true);
            }
        }
    });
}