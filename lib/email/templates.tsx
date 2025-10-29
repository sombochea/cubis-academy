// Email templates for Resend integration
// These are React components that will be rendered to HTML

interface EmailTemplateProps {
  userName: string;
  verificationCode: string;
  expiresIn?: string;
}

export function VerificationEmailTemplate({ 
  userName, 
  verificationCode,
  expiresIn = '24 hours'
}: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#007FFF', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>
          Cubis Academy
        </h1>
      </div>
      
      <div style={{ padding: '40px 20px', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: '#17224D', marginBottom: '20px' }}>
          Verify Your Email Address
        </h2>
        
        <p style={{ color: '#363942', fontSize: '16px', lineHeight: '1.6' }}>
          Hi {userName},
        </p>
        
        <p style={{ color: '#363942', fontSize: '16px', lineHeight: '1.6' }}>
          Thank you for registering with Cubis Academy! To complete your registration and start enrolling in courses, please verify your email address.
        </p>
        
        <div style={{ 
          backgroundColor: '#F4F5F7', 
          padding: '30px', 
          borderRadius: '8px', 
          textAlign: 'center',
          margin: '30px 0'
        }}>
          <p style={{ color: '#363942', fontSize: '14px', marginBottom: '10px' }}>
            Your verification code:
          </p>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#007FFF',
            letterSpacing: '8px',
            fontFamily: 'monospace'
          }}>
            {verificationCode}
          </div>
        </div>
        
        <p style={{ color: '#363942', fontSize: '14px', lineHeight: '1.6' }}>
          This code will expire in {expiresIn}. If you didn't request this verification, please ignore this email.
        </p>
        
        <div style={{ 
          marginTop: '40px', 
          paddingTop: '20px', 
          borderTop: '1px solid #E5E7EB' 
        }}>
          <p style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.6' }}>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#F4F5F7', 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        <p style={{ color: '#6B7280', fontSize: '12px', margin: 0 }}>
          © {new Date().getFullYear()} Cubis Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
}

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export function WelcomeEmailTemplate({ userName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#007FFF', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>
          Welcome to Cubis Academy! 🎉
        </h1>
      </div>
      
      <div style={{ padding: '40px 20px', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: '#17224D', marginBottom: '20px' }}>
          Your Email is Verified!
        </h2>
        
        <p style={{ color: '#363942', fontSize: '16px', lineHeight: '1.6' }}>
          Hi {userName},
        </p>
        
        <p style={{ color: '#363942', fontSize: '16px', lineHeight: '1.6' }}>
          Congratulations! Your email has been successfully verified. You can now:
        </p>
        
        <ul style={{ color: '#363942', fontSize: '16px', lineHeight: '1.8' }}>
          <li>Browse and enroll in courses</li>
          <li>Access course materials</li>
          <li>Track your learning progress</li>
          <li>Submit payments</li>
        </ul>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={dashboardUrl}
            style={{
              display: 'inline-block',
              padding: '15px 40px',
              backgroundColor: '#007FFF',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Go to Dashboard
          </a>
        </div>
        
        <p style={{ color: '#363942', fontSize: '14px', lineHeight: '1.6' }}>
          We're excited to have you as part of our learning community!
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#F4F5F7', 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        <p style={{ color: '#6B7280', fontSize: '12px', margin: 0 }}>
          © {new Date().getFullYear()} Cubis Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
}
