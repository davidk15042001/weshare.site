<div>
    <p><b><?php echo e(translate('Dear')); ?> <?php echo e($data['name']); ?>,</b></p>
    <p><?php echo e(translate('Welcome to WeShare.Site! We are thrilled to have you join our community of sharing and collaboration.')); ?></p>
    
    <?php if($data['plan'] == 'pro'): ?>
        <p><?php echo e(translate('To get started, click the button below.')); ?></p>
        <div style="margin:20px 0">
            <a href="<?php echo e(route('dashboard')); ?>" style="background-color:#df2351;color:#fff;text-decoration:none;padding:10px;border-radius:5px"><?php echo e(translate('Go To Dashboard')); ?></a>
        </div>
        <p><?php echo e(translate("You'll have access to all the features of WeShare.Site. You can start sharing your information, projects, connect with others, and explore and grow your business.")); ?></p>
        <p><?php echo e(translate("If you have any questions or need assistance, don't hesitate to reach out to our support team. We are here to help!")); ?><br/>
            <a href="mailto:support<?php echo e('@'); ?><?php echo e(env('APP_DOMAIN','weshare.site')); ?>">Support<?php echo e('@'); ?><?php echo e(env('APP_DOMAIN','weshare.site')); ?></a>
        </p>
    <?php else: ?>
        <p><?php echo e(translate("You're now registered for our free version, which includes a variety of basic features to help you get started. You can start sharing your information and connecting with others.")); ?></p>

        <p><?php echo e(translate("If you find that you need additional features, you can easily upgrade to our premium version for just 47€ per year. This will give you access to even more tools and resources to help you take your sharing and collaboration to the next level.")); ?></p>

        <p><?php echo e(translate('To upgrade, simply log into your account and click on the "Upgrade" button.')); ?></p>

        <div style="margin:20px 0">
            <a href="<?php echo e(route('subscriptions.index')); ?>" style="background-color:#df2351;color:#fff;text-decoration:none;padding:10px;border-radius:5px"><?php echo e(translate('Upgrade')); ?></a>
        </div>

        <p><?php echo e(translate("If you have any questions or need assistance, please don't hesitate to reach out to our support team. We're here to help you make the most of your WeShare.Site experience.")); ?></p>
    <?php endif; ?>

    <div style="margin:20px 0">
        <?php echo e(translate('Best regards')); ?>,
        <div>The <a href="<?php echo e(env('APP_URL', 'https://app.vi-site.de')); ?>"><?php echo e(env('APP_NAME', 'WeShare.Site')); ?></a> Team</div>
    </div>
</div><?php /**PATH C:\Laravel projects\weshare\resources\views/emails/sendwelcome.blade.php ENDPATH**/ ?>