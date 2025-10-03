<template>
    <div class="contact">
        <section class="hero">
            <h1 class="title">Contact Me</h1>
            <p class="subtitle">Get in touch for collaboration or inquiries</p>
        </section>
        
        <div class="contact-form">
            <form>
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" class="form-control" placeholder="Your name">
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" class="form-control" placeholder="Your email address">
                </div>
                
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" class="form-control" rows="5" placeholder="Your message"></textarea>
                </div>
                
                <div class="submit-wrapper">
                    <button type="submit" class="btn btn-primary">Send Message</button>
                </div>
            </form>
            
            <div class="contact-info">
                <h3>Other Ways to Connect</h3>
                
                <div class="contact-method">
                    <span class="contact-method-label">Email:</span>
                    <span>your.email@example.com</span>
                </div>
                
                <div class="contact-method">
                    <span class="contact-method-label">LinkedIn:</span>
                    <a href="https://linkedin.com/in/yourprofile" target="_blank">linkedin.com/in/yourprofile</a>
                </div>
                
                <div class="contact-method">
                    <span class="contact-method-label">GitHub:</span>
                    <a href="https://github.com/yourusername" target="_blank">github.com/yourusername</a>
                </div>
            </div>
        </div>
    </div>
</template>