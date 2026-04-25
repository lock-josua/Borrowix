<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrialEndingMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $schoolName,
        public string $adminEmail,
        public int $daysRemaining,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Your Trial Ends in {$this->daysRemaining} Days — Borrowix");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.trial-ending');
    }
}
