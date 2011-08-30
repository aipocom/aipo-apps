$.helperJsonUrl = "/my/sheet/helperjson";
$.tmpDefineFormValues = {};
$.columnIndexMax = 0;
$.ajustHeight = function() {
};
$.onChangeDataType = function(selector, index, select) {
    var dataType = $(select).val();
    var col = {"index":index, "dataType":dataType}
    $(selector + " textarea").each(function() {
        $.tmpDefineFormValues[$(this).attr("name")] = $(this).text();
    });
    $.getDefineFormBody(col, function(html) {
        $(selector).html(html);
    }, $(select.form).serialize());
}

$.getDefineFormBody = function(column, callback, dataString) {
    var data = $.getUrlParams('?' + dataString);
    data['mode'] = 'defineForm.body';
    data['index'] = column.index;
    data['dataType'] = column.dataType;

    $.ajax({
        type : "POST",
        url : $.helperJsonUrl,
        cache : false,
        dataType : "text",
        data : data,
        success : function(result) {
            var jsonData = $.evalJsonCommentFiltered(result);
            var html = $.unescapeHTML(jsonData);
            if (callback) {
                callback(html);
            }
        },
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            var error = "Request Error: " + errorThrown + ". " + $.helperJsonUrl;
        }
    });
}

$.loadDefineForm = function(selector, url, id, callback) {
    $.ajax({
        type : "POST",
        url : url,
        cache : false,
        dataType : "text",
        data : {"id":id, "mode": "form", "formType": "define"},
        success : function(result) {
            var jsonData = $.evalJsonCommentFiltered(result);
            var values = jsonData["values"];
            if (values && values.length > 0) {
                $(selector).empty();
                $.tmpDefineFormValues = {};
                var size = values.length;
                for (var i = 0; i < size; i++) {
                    var html = $.unescapeHTML(values[i]);
                    $(selector).append(html);
                }

                $(selector + " input.nameField").each(function() {
                    var _index = parseInt($(this).attr('name').replace('name_', ''));
                    if (_index > $.columnIndexMax) {
                        $.columnIndexMax = _index;
                    }
                });
            } else {
                $.columnIndexMax = 0;
                if ($(selector + " input.nameField").size() == 0) {
                    $.addDefineForm(selector);
                }
            }

            if (callback) {
                callback(jsonData);
            }
        },
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            var error = "Request Error: " + errorThrown + ". " + $.helperJsonUrl;
        }
    });
}

$.addDefineForm = function(selector) {
    var index = $.columnIndexMax;
    $(selector + " input.nameField").each(function() {
        var _index = parseInt($(this).attr('name').replace('name_', ''));
        if (_index > index) {
            index = _index;
        }
    });
    var newIndex = index + 1;
    var col = {"index": newIndex, "dataType": "text"}
    $.getDefineForm(col, function(html) {
        var newForm = $(html).hide();
        $(selector).append(newForm);
        newForm.slideDown("normal", $.ajustHeight());
    });
}

$.deleteColumn = function(selector, index) {
    if (index > $.columnIndexMax) {
        $("#defineForm_" + index).slideUp("normal", function() {
            $("#defineForm_" + index).remove();
            $.ajustHeight();
        });
    } else {
        $('<input>')
            .attr('type', 'hidden')
            .attr('name', 'deleteColumns[]').val(index).appendTo(selector);
        $("#defineForm_" + index).slideUp("normal", $.ajustHeight());
    }
}

$.getDefineForm = function(column, callback) {
    $.ajax({
        type : "POST",
        url : $.helperJsonUrl,
        cache : false,
        dataType : "text",
        data : {"mode":"defineForm", "index":column.index, "dataType":column.dataType},
        success : function(result) {
            var jsonData = $.evalJsonCommentFiltered(result);
            var html = $.unescapeHTML(jsonData);
            if (callback) {
                callback(html);
            }
        },
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            var error = "Request Error: " + errorThrown + ". " + $.helperJsonUrl;
        }
    });
}

$.loadDataForm = function(selector, url, id, sheetKey, callback) {
    $.ajax({
        type : "POST",
        url : url,
        cache : false,
        dataType : "text",
        data : {"id":id, "sheetKey":sheetKey, "mode": "form", "formType": "data"},
        success : function(result) {
            var jsonData = $.evalJsonCommentFiltered(result);
            var values = jsonData["values"];
            if (values && values.length > 0) {
                $(selector).empty();
                var size = values.length;
                for (var i = 0; i < size; i++) {
                    var html = $.unescapeHTML(values[i]);
                    $(selector).append(html);
                }
            }

            $(".dateField").datepicker(
                {dateFormat: 'yy/mm/dd', duration: 0}
            );
            $(".datetimeField").datetimepicker(
                {dateFormat: 'yyyy/mm/dd HH:MM', duration: 0}
            );

            if (callback) {
                callback(jsonData);
            }
        },
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            var error = "Request Error: " + errorThrown + ". " + $.helperJsonUrl;
        }
    });
}

$.deleteSheet = function(url, sheetKey, callback) {
    $.ajax({
        type : "POST",
        url : url,
        cache : false,
        dataType : "text",
        data : {"key":sheetKey},
        success : function(result) {
            var jsonData = $.evalJsonCommentFiltered(result);
            if (callback) {
                callback(jsonData);
            }
        },
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            var error = "Request Error: " + errorThrown + ". " + url;
        }
    });
}

$.deleteSheetData = function(url, key, sheetKey, callback) {
    $.ajax({
        type : "POST",
        url : url,
        cache : false,
        dataType : "text",
        data : {"key":key, "sheetKey":sheetKey},
        success : function(result) {
            var jsonData = $.evalJsonCommentFiltered(result);
            if (callback) {
                callback(jsonData);
            }
        },
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            var error = "Request Error: " + errorThrown + ". " + url;
        }
    });
}

$.membersForm = function(selector, jsonData) {
    var info = jsonData['info'];
    var members = info['members'];
    if (members == null || members.length == 0) {
        members = {};
        members[info['permissionMap'][0]['key']] = [];
    }
    var count = 1;
    for (var k in members) {
        var membersText = "";
        var size = members[k].length;
        for (var i = 0; i < size; i++) {
            var member = members[k][i];
            membersText += member + "\n";
        }
        var name2 = 'members_' + count;
        $('<textarea>')
            .addClass('longtextField')
            .attr('name', name2)
            .attr('id', name2 + 'Field')
            .text(membersText).appendTo(selector);

        var name = 'permission_' + count;
        $('<select>')
            .attr('name', name)
            .attr('id', name + 'Field').appendTo(selector);
        $.tmpl("optionsTemplate", info['permissionMap']).appendTo('#' + name + 'Field');
        $('#' + name + 'Field').val(k);

        count++;
    }

}

$.listData = function(sheetKey, listId, itemId, url, data, callback) {
    if (!data) {
        data = {};
    }
    data['sheetKey'] = sheetKey
    $.initList(listId, itemId, true, url, data, function(jsonDataList) {
        var valueList = jsonDataList['values'];
        var lengthList = valueList.length;
        for (var j = 0; j < lengthList; j++) {
            var dataRow = valueList[j];
            dataRow['rowHtml'] = $('<div>').append($.tmpl("tdTemplate", dataRow)).remove().html();
            dataRow['sheetKey'] = sheetKey;
        }

        $("#dataTitle").text(jsonDataList.info['dataTitle']);
        if (jsonDataList.info && jsonDataList.info['curnext']) {
            $("#" + listId).after(
                $("<div>").addClass('center').append(
                    $("<button>").text(jsonDataList.info['more'])
                        .click(function() {
                            $(this).remove();
                            $.listData(sheetKey, listId, itemId, url, {"curnext": jsonDataList.info['curnext']});
                        })
                )
            );
        }
        $.setListValues("dataList", "dataItem", true, jsonDataList);
        if (callback) {
            callback(jsonDataList);
        }
    });
}

$.overrideAjaxFunc = function(oauth) {
    //override ajax function
    $._ajax = $.ajax;
    $.ajax = function(args) {
        var opt_params = {"nocache": new Date().getTime()};
        opt_params[gadgets.io.RequestParameters.METHOD] = args.type;
        opt_params[gadgets.io.RequestParameters.HEADERS] = args.requestHeaders;
        opt_params[gadgets.io.RequestParameters.CONTENT_TYPE] =
            args.dataType === 'xml' && gadgets.io.ContentType.DOM ||
                args.dataType === 'feed' && gadgets.io.ContentType.FEED ||
                gadgets.io.ContentType.TEXT;

        if (args.data) {
            var data = args.data;
            if ($.isString(args.data)) {
                opt_params[gadgets.io.RequestParameters.POST_DATA] = args.data;
            } else {
                opt_params[gadgets.io.RequestParameters.POST_DATA] = gadgets.io.encodeValues(data);
            }

        }

        if (oauth == 'signed') {
            opt_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.SIGNED;
        } else if (oauth) {
            opt_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
            opt_params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = oauth;
        }

        gadgets.io.makeRequest(args.url, function(response) {
            if (response.rc == 200) {
                if (args.success) {
                    args.success(response.data);
                }
            } else {
                if (args.error) {
                    args.error(null, response.rc, response.error);
                }
            }
        }, opt_params);
    }

    $.ajustHeight = function() {
        setInterval(function() {
            gadgets.window.adjustHeight();
        }, 200);
    };
};