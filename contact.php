<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Cache-Control: no-store, max-age=0');

function value(string $key): string {
    return trim((string) ($_POST[$key] ?? ''));
}

function redirectToThanks(string $status): void {
    header('Location: thank-you.html?status=' . rawurlencode($status), true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirectToThanks('invalid');
}

$name = value('name');
$phone = value('phone');
$email = value('email');
$message = value('message');
$enquiryType = value('enquiry_type') ?: 'Website enquiry';
$service = value('service');
$propertyType = value('property_type');
$postcode = value('postcode');
$address = value('address');
$addOn = value('add_on');
$estimate = value('estimate');

if ($name === '' || $phone === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirectToThanks('invalid');
}

$recipient = 'kevin@evercleanwcs.co.uk';
$subject = 'New EverClean enquiry: ' . preg_replace('/[\r\n]+/', ' ', $enquiryType);
$boundary = 'everclean-' . bin2hex(random_bytes(12));
$safeName = preg_replace('/[\r\n]+/', ' ', $name);
$details = [
    'Enquiry type' => $enquiryType,
    'Service' => $service,
    'Property type' => $propertyType,
    'Additional service' => $addOn,
    'House number and street' => $address,
    'Postcode' => $postcode,
    'Estimated regular price' => $estimate,
    'Name' => $name,
    'Phone' => $phone,
    'Email' => $email,
    'Message' => $message,
];

$body = "--{$boundary}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
$body .= "New enquiry from the EverClean website\r\n\r\n";
foreach ($details as $label => $detail) {
    if ($detail !== '') $body .= "{$label}: {$detail}\r\n";
}

// Quote-assistant enquiries include a one-row CSV that can be imported into Squeegee.
// Scheduling fields are intentionally blank: Kevin reviews and confirms each job first.
if ($enquiryType === 'Quote assistant') {
    $squeegeeHeaders = [
        'customer name', 'customer email marketing accepted', 'customer sms marketing accepted',
        'customer address', 'customer phone', 'customer phone other', 'customer email',
        'customer latitude', 'customer longitude', 'customer notes', 'customer source',
        'customer default notification', 'customer automatically generate invoices on job completion',
        'customer automatically send invoices when created', 'customer hide default invoice notes',
        'customer hide gocardless signup from invoice', 'customer hide gocardless from invites',
        'customer hide job prices from worker', 'customer hide stripe from invites',
        'customer hide stripe pay button from invoice', 'customer hide tax', 'customer invoice notes',
        'customer payment period', 'customer require signature', 'customer take payment on invoiced',
        'customer tax rate', 'external id', 'customer inactive', 'customer balance', 'job reference',
        'job assignee', 'job address', 'job latitude', 'job longitude', 'job description', 'job price',
        'job last done', 'job date', 'job first date', 'job first price', 'job frequency interval',
        'job frequency type', 'job day of week', 'job day of month', 'job week of month', 'job time',
        'job service', 'job round', 'job duration'
    ];

    $customerAddress = implode(', ', array_filter([$address, $postcode]));
    $notes = implode(" | ", array_filter([
        'Website quote assistant enquiry',
        $service !== '' ? "Service: {$service}" : '',
        $propertyType !== '' ? "Property: {$propertyType}" : '',
        $addOn !== '' ? "Add-on: {$addOn}" : '',
        $estimate !== '' ? "Estimate: {$estimate}" : '',
        $message !== '' ? "Customer notes: {$message}" : '',
    ]));
    $externalId = 'EVERCLEAN-WEB-' . date('Ymd-His') . '-' . bin2hex(random_bytes(3));
    $squeegeeRow = array_fill(0, count($squeegeeHeaders), '');
    $squeegeeValues = [
        'customer name' => $name,
        'customer email marketing accepted' => 'N',
        'customer sms marketing accepted' => 'N',
        'customer address' => $customerAddress,
        'customer phone' => $phone,
        'customer email' => $email,
        'customer notes' => $notes,
        'customer source' => 'EverClean website quote assistant',
        'external id' => $externalId,
        'customer inactive' => 'false',
        'customer balance' => '0.00',
    ];
    foreach ($squeegeeHeaders as $column => $header) {
        if (array_key_exists($header, $squeegeeValues)) $squeegeeRow[$column] = $squeegeeValues[$header];
    }

    $csvStream = fopen('php://temp', 'r+');
    fputcsv($csvStream, $squeegeeHeaders);
    fputcsv($csvStream, $squeegeeRow);
    rewind($csvStream);
    $csvContents = stream_get_contents($csvStream);
    fclose($csvStream);
    if ($csvContents !== false) {
        $csvFilename = 'squeegee-import-' . date('Y-m-d-His') . '.csv';
        $body .= "\r\n--{$boundary}\r\n";
        $body .= "Content-Type: text/csv; charset=UTF-8; name=\"{$csvFilename}\"\r\n";
        $body .= "Content-Disposition: attachment; filename=\"{$csvFilename}\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= chunk_split(base64_encode($csvContents));
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
    'Reply-To: ' . $safeName . ' <' . $email . '>',
    'X-Mailer: EverClean Website',
];

if (!mail($recipient, $subject, $body, implode("\r\n", $headers))) {
    redirectToThanks('error');
}

redirectToThanks('success');
