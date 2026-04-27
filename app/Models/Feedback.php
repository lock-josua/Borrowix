<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    // Feedback is stored in the central database.
    // If you are using a package like Stancl/Tenancy, you might need to ensure this table is central.
    // Usually, specifying no connection or explicit central connection works depending on the setup.
    // Assuming the central database is the default connection when accessed properly.

    protected $fillable = [
        'tenant_id',
        'user_name',
        'user_email',
        'user_role',
        'type',
        'title',
        'description',
        'admin_response',
        'responded_at',
        'status',
        'attachment_path',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        // Dynamically set the connection to the central database
        $this->setConnection(config('tenancy.database.central_connection'));
    }
}
