<%@page pageEncoding="UTF-8" isELIgnored="false" session="false"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@taglib prefix="f" uri="http://www.slim3.org/functions"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>gef Index</title>
</head>
<body>

Register:
<form method="post" action="register">
categories<textarea name="categories"></textarea><br />
function<textarea name="function"></textarea><br />
comments<textarea name="comments"></textarea><br />
form<textarea name="form"></textarea><br />
<input type="submit" value="Get Functions"/>
</form>

UrlRegister:
<form method="post" action="urlregister">
categories<input id="categories" type="text" /><br />
function<input id="function" type="text" /><br />
comments<input id="comments" type="text" /><br />
form<input id="form" type="text" /><br />
<input id="get" type="button" value="Get UrlParameter"/>
</form>

Search:
<form method="post" action="search">
categories<textarea name="categories"></textarea><br />
function<textarea name="function"></textarea><br />
comments<textarea name="comments"></textarea><br />
form<textarea name="form"></textarea><br />
<input type="submit" value="Search Functions"/>
</form>

<script src="http://code.jquery.com/jquery-1.4.2.min.js"></script>
<script type="text/javascript">
$(function() {
    $("#get").click(function(){
        $.ajax({
            type: "POST",
            url: "hello",
            data: "user=" + $("#user").val(),
            success: function(msg){
                alert("Input User: " + msg);
            }
         });
        return false;
    });
});
</script>

</body>
</html>
