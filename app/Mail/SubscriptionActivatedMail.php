<?php

namespace App\Mail;

use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionActivatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $schoolName,
        public string $plan,
        public int $amount,
        public CarbonImmutable $nextBilling,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Subscription Activated — Borrowix');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.subscription-activated');
    }
}
