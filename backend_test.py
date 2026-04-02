#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class CrocConsultingAPITester:
    def __init__(self, base_url="https://consult-pro-139.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })

            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_login_valid_credentials(self):
        """Test login with valid demo credentials"""
        login_data = {
            "clientId": "ERG-2025",
            "password": "demo1234"
        }
        success, response = self.run_test(
            "Login with Valid Credentials",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        if success and response.get('success'):
            print(f"   Client Name: {response.get('clientName')}")
            return True, response.get('clientName')
        return False, None

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            "clientId": "INVALID-ID",
            "password": "wrongpassword"
        }
        success, response = self.run_test(
            "Login with Invalid Credentials",
            "POST",
            "auth/login",
            200,  # API returns 200 but success=false
            data=login_data
        )
        if success and not response.get('success'):
            print(f"   Correctly rejected invalid credentials")
            return True
        return False

    def test_get_quotes(self):
        """Test getting quotes for demo client"""
        success, response = self.run_test(
            "Get Quotes for ERG-2025",
            "GET",
            "quotes/ERG-2025",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} quotes")
            for quote in response[:2]:  # Show first 2 quotes
                print(f"   - {quote.get('id')}: {quote.get('project')}")
            return True, response
        return False, []

    def test_get_submissions(self):
        """Test getting submissions for demo client"""
        success, response = self.run_test(
            "Get Submissions for ERG-2025",
            "GET",
            "submissions/ERG-2025",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} submissions")
            return True, response
        return False, []

    def test_create_submission(self):
        """Test creating a new submission"""
        submission_data = {
            "id": f"CRC-TEST-{datetime.now().strftime('%H%M%S')}",
            "date": datetime.now().strftime("%d %B %Y"),
            "tab": "fillout",
            "contact": {
                "name": "Test User",
                "email": "test@example.com",
                "company": "Test Company",
                "phone": "+61400000000",
                "project": "Test Project",
                "timeframe": "Q2 2025",
                "quoteType": "Binding",
                "urgency": "Standard",
                "notes": "Test submission"
            },
            "files": [],
            "items": [
                {
                    "desc": "Test Equipment",
                    "qty": 1,
                    "unit": "33kV",
                    "specs": "Test specifications"
                }
            ],
            "status": "New",
            "clientId": "ERG-2025"
        }
        
        success, response = self.run_test(
            "Create New Submission",
            "POST",
            "submissions",
            200,
            data=submission_data
        )
        if success and response.get('success'):
            print(f"   Created submission: {response.get('id')}")
            return True, response.get('id')
        return False, None

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test Contact",
            "email": "contact@test.com",
            "company": "Test Corp",
            "phone": "+61400000001",
            "message": "Test message from API test"
        }
        
        success, response = self.run_test(
            "Submit Contact Form",
            "POST",
            "contact",
            200,
            data=contact_data
        )
        return success and response.get('success')

    def test_quote_approval(self):
        """Test quote approval functionality"""
        # First get quotes to find one to approve
        success, quotes = self.test_get_quotes()
        if not success or not quotes:
            print("   Cannot test approval - no quotes found")
            return False
            
        # Find a quote that's not already approved
        quote_to_approve = None
        for quote in quotes:
            if not quote.get('approved', False):
                quote_to_approve = quote
                break
                
        if not quote_to_approve:
            print("   All quotes already approved")
            return True  # This is actually fine
            
        quote_id = quote_to_approve['id']
        success, response = self.run_test(
            f"Approve Quote {quote_id}",
            "POST",
            f"quote/{quote_id}/approve",
            200
        )
        return success and response.get('success')

    def test_rfi_response(self):
        """Test RFI response functionality"""
        # First get quotes to find one with pending RFI
        success, quotes = self.test_get_quotes()
        if not success or not quotes:
            print("   Cannot test RFI - no quotes found")
            return False
            
        # Find a quote with pending RFI
        quote_with_rfi = None
        rfi_index = None
        for quote in quotes:
            for i, rfi in enumerate(quote.get('rfi', [])):
                if not rfi.get('response'):
                    quote_with_rfi = quote
                    rfi_index = i
                    break
            if quote_with_rfi:
                break
                
        if not quote_with_rfi:
            print("   No pending RFIs found")
            return True  # This is fine
            
        quote_id = quote_with_rfi['id']
        rfi_data = {
            "response": "Test RFI response from API test"
        }
        
        success, response = self.run_test(
            f"Respond to RFI {quote_id}[{rfi_index}]",
            "POST",
            f"quote/{quote_id}/rfi/{rfi_index}/respond",
            200,
            data=rfi_data
        )
        return success and response.get('success')

    def test_ai_generation(self):
        """Test AI quote generation"""
        # First create a submission to generate AI for
        success, submission_id = self.test_create_submission()
        if not success or not submission_id:
            print("   Cannot test AI generation - submission creation failed")
            return False
            
        ai_data = {
            "submissionId": submission_id
        }
        
        success, response = self.run_test(
            f"Generate AI Quote for {submission_id}",
            "POST",
            "ai/generate",
            200,
            data=ai_data
        )
        
        if success and response.get('success'):
            output = response.get('output', '')
            print(f"   AI Output length: {len(output)} characters")
            print(f"   AI Output preview: {output[:100]}...")
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Croc Consulting API Tests")
        print(f"   Base URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test authentication
        self.test_login_valid_credentials()
        self.test_login_invalid_credentials()
        
        # Test quote management
        self.test_get_quotes()
        self.test_quote_approval()
        self.test_rfi_response()
        
        # Test submissions
        self.test_get_submissions()
        self.test_create_submission()
        
        # Test contact form
        self.test_contact_form()
        
        # Test AI generation (requires EMERGENT_LLM_KEY)
        self.test_ai_generation()
        
        # Print summary
        print(f"\n📊 Test Results:")
        print(f"   Tests run: {self.tests_run}")
        print(f"   Tests passed: {self.tests_passed}")
        print(f"   Tests failed: {self.tests_run - self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"   - {failure.get('test')}: {failure}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CrocConsultingAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())