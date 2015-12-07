<?php
$filename = "saves/" . time() . ".html";
$content = $_POST['html'];

// error_reporting(E_ALL);
// phpinfo();

$file = fopen($filename, 'w') or die("Can not open file.");
fwrite($file, $content);
fclose($file);

print $filename;
?>