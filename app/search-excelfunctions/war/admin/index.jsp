<%@page pageEncoding="UTF-8" isELIgnored="false" session="false"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@taglib prefix="f" uri="http://www.slim3.org/functions"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>管理者画面 </title>
</head>
<body>
<div>
Register:
<form method="post" action="register">
<table class="listTable wide" border=2>
<tbody>
<tr>
<td>categories</td>
<td>
 <select name="categories" >
 <option ${f:select("categories", "1")}>検索/行列関数</option>
 <option ${f:select("categories", "2")}>データベース関数</option>
 <option ${f:select("categories", "3")}>エンジニアリング関数</option>
 <option ${f:select("categories", "4")}>財務関数</option>
 <option ${f:select("categories", "5")}>情報関数</option>
 <option ${f:select("categories", "6")}>数学/三角関数</option>
 <option ${f:select("categories", "7")}>統計関数 </option>
 <option ${f:select("categories", "8")}>日付/時刻関数</option>
 <option ${f:select("categories", "9")}>文字列操作関数</option>
 <option ${f:select("categories", "10")}>論理関数 </option>
 </select>
</td>
</tr>

<tr>
<td>function</td>
<td><input type="text" name="function" value="" ><br /></td>
</tr>

<tr>
<td>comments</td>
<td><textarea name="comments"></textarea><br /></td>
</tr>

<tr>
<td>form</td>
<td><input type="text" name="form" value="="><br /></td>
</tr>
</tbody>
</table>

<input type="submit" value="登録する"/>
</form>

</div>

<div>
<br />
<br />
<br />
Delete:
<form method="post" action="delete">
<table class="listTable wide" border=2>
<tbody>
<tr>
<td>function</td>
<td><input type="text" name="function" value=""><br /></td>
</tr>
</tbody>
</table>
<input type="submit" value="削除する"/>
</form>
</div>

<p>※登録上の注意</p>
keyはfunctionです。<br />
更新したい場合は変更したい項目のみ変えることで変更できます。変更の必要のない部分は間違えの内容同じ値を入力して下さい。<br />
・categories <br />
1:検索/行列関数<br />
2:データベース関数<br />
3:エンジニアリング関数<br />
4:財務関数<br />
5:情報関数<br />
6:数学/三角関数<br />
7:統計関数<br />
8:日付/時刻関数<br />
9:文字列操作関数<br />
10:論理関数<br />
<br />
・function  大文字で入力する<br />
ex) COUNTIF<br />
<br />
・comments  最後は「。」で終わる。<br />
<br />
・form  「=」で始まり、要素は「（）」で囲み、要素の間は「,」で区切る。<br />
ex) =COUNTIF(範囲, 検索条件)<br />
</body>
</html>
