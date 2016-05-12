<!DOCTYPE html>
<html lang="ko">
<head>
  <title>댓글</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
  <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>
  <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
  <script src="http://capstone.hae.so/v2/js/clientHJH.php?no=1"></script>
</head>
<body>

<div class="container">
    <h2>comment</h2>
  <!-- Trigger the modal with a button -->
  <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Open Modal</button>

  <!-- Modal -->
  <div class="modal fade" id="myModal" role="dialog">
    <div class="modal-dialog">
    
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">comment</h4>
        </div>

		<form name="comment" onsubmit="return createComment3();" method="post" >
			<div class="modal-body">
					<textarea class="form-control" rows="5" id="comment" name="description"></textarea>
					<br>
				<button type="submit" class="btn btn-default"  >Submit</button>
                <br>
            </div>
        </form>
          <div class="col-sm-12" style="overflow-x:auto"><span id="showComment"></span></div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
      
    </div>
  </div>
  
</div>


</body>
</html>
