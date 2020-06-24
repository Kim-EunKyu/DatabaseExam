<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>새글등록</title>
</head>
<body>
    <center>
        <h1>글 등록</h1>
        <a href="logout_proc.jsp">Log-out</a>
        <hr>
        <form action="insertBoard_proc.jsp" method="POST">
            <table border="1" cellspacing="0" cellpadding="0">
                <tr>
                    <td bgcolor="orange" width="70">제목</td>
                    <td align="left"><input type="text" name="title"></td>
                </tr>
                <tr>
                    <td bgcolor="orange">작성자</td>
                    <td align="left"><input type="text" name="writer" size="10"></td>
                </tr>
                <tr>
                    <td bgcolor="orange">내용</td>
                    <td align="left"><textarea name="content" id="" cols="40" rows="10"></textarea></td>
                </tr>
                <tr>
                    <td colspan="2" align="center"><input type="submit" value="새글 등록"></td>
                </tr>
            </table>
        </form>
        <hr>
        <a href="getBoardList.jsp">글 목록 가기</a>
    </center>
</body>
</html>