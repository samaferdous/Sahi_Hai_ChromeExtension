<?php
header("Access-Control-Allow-Origin: *");

if (isset($_POST['url']) && filter_var($_POST['url'], FILTER_VALIDATE_URL)) {
    $site = $_POST['url'];

    // Initialize cURL session
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $site);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); // Follow redirects
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Set timeout limit

    // Execute cURL request and store the result
    $html = curl_exec($ch);
    
    if (curl_errno($ch)) {
        echo "Error: Unable to fetch the content from the provided URL. cURL error: " . curl_error($ch);
        exit();
    }

    // Close cURL session
    curl_close($ch);

    // Write the fetched content to a file (markup.txt)
    $bytes = file_put_contents('markup.txt', $html);
    if ($bytes === false) {
        echo "Error: Failed to write content to markup.txt.";
        exit();
    }

    // Sanitize the URL to prevent shell injection attacks
    $escaped_site = escapeshellarg($site);

    // Execute Python script with the sanitized URL
    $decision = exec("python test.py $escaped_site 2>&1");

    // Return the decision (SAFE or NOT SAFE) to the client
    echo $decision;
} else {
    echo "Error: Invalid or missing 'url' parameter.";
}
?>
