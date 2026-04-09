<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SchoolCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $schoolName,
        public string $adminEmail,
        public string $subdomainUrl,
        public string $loginUrl,
        public string $resetLink,
    ) {
        $this->queue = false;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your School Has Been Created — Borrowix',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.school-created',
        );
    }
}
