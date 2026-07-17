<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

function value(string $key): string {
    return trim((string) ($_POST[$key] ?? ''));
}

function reply(int $status, bool $success, string $message): void {
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

$name = value('name');
$phone = value('phone');
$email = value('email');
$message = value('message');
$enquiryType = value('enquiry_type') ?: 'Website enquiry';
$service = value('service');
$propertyType = value('property_type');
$postcode = value('postcode');

if ($name === '' || $phone === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(422, false, 'Please provide your name, phone number and a valid email address.');
}

$recipient = 'kevin@evercleanwcs.co.uk';
$subject = 'New EverClean enquiry: ' . preg_replace('/[\r\n]+/', ' ', $enquiryType);
$boundary = 'everclean-' . bin2hex(random_bytes(12));
$safe = static fn (string $text): string => htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

$details = [
    'Enquiry type' => $enquiryType,
    'Service' => $service,
    'Property type' => $propertyType,
    'Postcode' => $postcode,
    'Name' => $name,
    'Phone' => $phone,
    'Email' => $email,
    'Message' => $message,
];

$body = "--{$boundary}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
$body .= "New enquiry from the EverClean website\r\n\r\n";
foreach ($details as $label => $detail) {
    if ($detail !== '') {
        $body .= "{$label}: {$detail}\r\n";
    }
}

$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
$uploaded = $_FILES['photos'] ?? null;
if (is_array($uploaded) && isset($uploaded['name']) && is_array($uploaded['name'])) {
    $count = min(count($uploaded['name']), 3);
    for ($index = 0; $index < $count; $index++) {
        if (($uploaded['error'][$index] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) continue;
        if (($uploaded['error'][$index] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK || ($uploaded['size'][$index] ?? 0) > 5 * 1024 * 1024) continue;
        $tmpName = $uploaded['tmp_name'][$index] ?? '';
        if (!is_uploaded_file($tmpName)) continue;
        $mime = mime_content_type($tmpName);
        if (!in_array($mime, $allowedMimeTypes, true)) continue;
        $filename = preg_replace('/[^A-Za-z0-9._-]/', '-', basename((string) $uploaded['name'][$index]));
        $contents = file_get_contents($tmpName);
        if ($contents === false) continue;
        $body .= "\r\n--{$boundary}\r\n";
        $body .= "Content-Type: {$mime}; name=\"{$filename}\"\r\n";
        $body .= "Content-Disposition: attachment; filename=\"{$filename}\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= chunk_split(base64_encode($contents));
    }
}
$body .= "\r\n--{$boundary}--\r\n";

$headers = [
    'MIME-Version: 1.0',
    "Content-Type: multipart/mixed; boundary=\"{$boundary}\"",
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: EverClean Website',
];

if (!mail($recipient, $subject, $body, implode("\r\n", $headers))) {
    reply(500, false, 'The enquiry email could not be sent.');
}

reply(200, true, 'Enquiry sent.');
