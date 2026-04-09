<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlanChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $schoolName,
        public string $oldPlan,
        public string $newPlan,
        public string $adminEmail,
    ) {
        $this->queue = false;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Subscription Has Been Updated — Borrowix',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.plan-changed',
        );
    }
}
