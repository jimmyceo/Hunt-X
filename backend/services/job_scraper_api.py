"""
Job scraper API clients for external job data providers
Implements JSearch (RapidAPI) and Apify job scraping fallbacks
"""

import os
import asyncio
import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import aiohttp

# Try to import apify-client, fallback to requests if not available
try:
    from apify_client import ApifyClient
    APIFY_AVAILABLE = True
except ImportError:
    APIFY_AVAILABLE = False
    logging.warning("apify-client not installed, using HTTP fallback for Apify")

logger = logging.getLogger(__name__)

# API Configuration
JSEARCH_API_KEY = os.getenv('JSEARCH_API_KEY', '0f2e4630e1mshf7dc35350afb1b7p1a0d82jsn86e901ee38a7')
JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com/search'

APIFY_TOKEN = os.getenv('APIFY_TOKEN', 'apify_api_fI4VWrbhusO4OoHZ29kpu9gbKaDQTw3DFTta')

# Region configuration mapping
REGION_CONFIG = {
    'US': {
        'primary': 'jsearch',
        'fallback': None,
        'jsearch_params': {'country': 'us', 'language': 'en'}
    },
    'UK': {
        'primary': 'jsearch',
        'fallback': None,
        'jsearch_params': {'country': 'uk', 'language': 'en'}
    },
    'EU': {
        'primary': 'jsearch',
        'fallback': None,
        'jsearch_params': {'country': 'eu', 'language': 'en'}
    },
    'AU': {
        'primary': 'apify',
        'apify_actor': 'seek-australia-jobs-scraper',
        'fallback': 'jsearch',
        'jsearch_params': {'country': 'au', 'language': 'en'}
    },
    'DE': {
        'primary': 'apify',
        'apify_actor': 'stepstone-germany-jobs-scraper',
        'fallback': 'jsearch',
        'jsearch_params': {'country': 'de', 'language': 'de'}
    },
    'REMOTE': {
        'primary': 'jsearch',
        'fallback': None,
        'jsearch_params': {
            'country': 'us',
            'language': 'en',
            'remote_jobs_only': 'true'
        }
    }
}


@dataclass
class ScrapedJob:
    """Standardized job data structure"""
    id: str
    title: str
    company: str
    location: str
    description: str
    url: str
    source: str  # 'jsearch' or 'apify'
    archetype: Optional[str] = None
    seniority: Optional[str] = None
    required_skills: List[str] = None
    salary_range: Optional[str] = None
    remote_policy: Optional[str] = None
    posted_date: Optional[datetime] = None
    match_score: Optional[float] = None
    quality_score: Optional[float] = None
    is_duplicate: bool = False

    def __post_init__(self):
        if self.required_skills is None:
            self.required_skills = []


class JSearchClient:
    """
    RapidAPI JSearch client for job searching
    Docs: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or JSEARCH_API_KEY
        self.base_url = JSEARCH_BASE_URL
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'X-RapidAPI-Key': self.api_key,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                'Accept': 'application/json'
            }
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def search(
        self,
        query: str,
        page: int = 1,
        num_pages: int = 1,
        country: str = 'us',
        language: str = 'en',
        remote_only: bool = False,
        date_posted: Optional[str] = None,
        employment_types: Optional[str] = None,
        job_requirements: Optional[str] = None,
        radius: Optional[int] = None
    ) -> List[ScrapedJob]:
        """
        Search jobs using JSearch API

        Args:
            query: Job search query (e.g., "Python Developer")
            page: Page number for pagination
            num_pages: Number of pages to fetch (1-20)
            country: Country code (us, uk, au, de, etc.)
            language: Language code (en, de, etc.)
            remote_only: Filter for remote jobs only
            date_posted: Filter by date (today, 3days, week, month)
            employment_types: Filter by type (FULLTIME, CONTRACTOR, etc.)
            job_requirements: Filter by requirements (under_3_years_experience, etc.)
            radius: Search radius in miles

        Returns:
            List of ScrapedJob objects
        """
        if not self.session:
            raise RuntimeError("Client not initialized. Use async with context manager.")

        params = {
            'query': query,
            'page': str(page),
            'num_pages': str(num_pages),
            'country': country,
            'language': language
        }

        if remote_only:
            params['remote_jobs_only'] = 'true'
        if date_posted:
            params['date_posted'] = date_posted
        if employment_types:
            params['employment_types'] = employment_types
        if job_requirements:
            params['job_requirements'] = job_requirements
        if radius:
            params['radius'] = str(radius)

        try:
            logger.info(f"[JSearch] Searching: {query} in {country}")
            async with self.session.get(self.base_url, params=params) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"[JSearch] API error {response.status}: {error_text}")
                    return []

                data = await response.json()
                jobs = self._parse_response(data)
                logger.info(f"[JSearch] Found {len(jobs)} jobs")
                return jobs

        except Exception as e:
            logger.error(f"[JSearch] Search failed: {e}")
            return []

    def _parse_response(self, data: Dict) -> List[ScrapedJob]:
        """Parse JSearch API response into ScrapedJob objects"""
        jobs = []

        # JSearch returns data in 'data' key
        job_listings = data.get('data', [])

        for job_data in job_listings:
            try:
                job = ScrapedJob(
                    id=job_data.get('job_id', f"jsearch_{len(jobs)}"),
                    title=job_data.get('job_title', 'Unknown'),
                    company=job_data.get('employer_name', 'Unknown'),
                    location=self._format_location(job_data),
                    description=job_data.get('job_description', '')[:5000],
                    url=job_data.get('job_apply_link', job_data.get('job_apply_link', '')),
                    source='jsearch',
                    salary_range=self._format_salary(job_data),
                    remote_policy=self._detect_remote_policy(job_data),
                    posted_date=self._parse_date(job_data.get('job_posted_at_datetime_utc')),
                    seniority=job_data.get('job_seniority', 'unknown'),
                    required_skills=job_data.get('job_required_skills', []) or []
                )
                jobs.append(job)
            except Exception as e:
                logger.warning(f"[JSearch] Failed to parse job: {e}")
                continue

        return jobs

    def _format_location(self, job_data: Dict) -> str:
        """Format location from job data"""
        city = job_data.get('job_city', '')
        state = job_data.get('job_state', '')
        country = job_data.get('job_country', '')
        is_remote = job_data.get('job_is_remote', False)

        if is_remote:
            return 'Remote'

        parts = [p for p in [city, state, country] if p]
        return ', '.join(parts) if parts else 'Unknown'

    def _format_salary(self, job_data: Dict) -> Optional[str]:
        """Format salary information"""
        min_sal = job_data.get('job_min_salary')
        max_sal = job_data.get('job_max_salary')
        currency = job_data.get('job_salary_currency', 'USD')
        period = job_data.get('job_salary_period', 'YEAR')

        if min_sal and max_sal:
            return f"{currency}{min_sal:,}-{max_sal:,}/{period.lower()}"
        elif min_sal:
            return f"{currency}{min_sal:,}+/{period.lower()}"
        return None

    def _detect_remote_policy(self, job_data: Dict) -> Optional[str]:
        """Detect remote work policy"""
        if job_data.get('job_is_remote', False):
            return 'remote'

        description = job_data.get('job_description', '').lower()
        if 'hybrid' in description:
            return 'hybrid'
        elif 'remote' in description or 'work from home' in description:
            return 'remote'
        return 'onsite'

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse ISO date string"""
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return None


class ApifyClientWrapper:
    """
    Apify client wrapper for job scraping actors
    Supports SEEK Australia and StepStone Germany
    """

    def __init__(self, token: Optional[str] = None):
        self.token = token or APIFY_TOKEN
        self.base_url = 'https://api.apify.com/v2'
        self.session: Optional[aiohttp.ClientSession] = None
        self._apify_client = None

        # Initialize official client if available
        if APIFY_AVAILABLE:
            try:
                self._apify_client = ApifyClient(self.token)
            except Exception as e:
                logger.warning(f"[Apify] Failed to initialize official client: {e}")

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def search_seek_australia(
        self,
        query: str,
        location: Optional[str] = None,
        max_results: int = 20
    ) -> List[ScrapedJob]:
        """
        Search SEEK Australia jobs using Apify

        Args:
            query: Job keywords
            location: Location in Australia (e.g., "Sydney", "Melbourne")
            max_results: Maximum number of results to return

        Returns:
            List of ScrapedJob objects
        """
        run_input = {
            'searchTerms': [query],
            'location': location or '',
            'maxItems': max_results,
            'proxyConfiguration': {'useApifyProxy': True}
        }

        return await self._run_actor(
            actor_id=' seek-australia-jobs-scraper',
            run_input=run_input,
            source_name='apify_seek_au'
        )

    async def search_stepstone_germany(
        self,
        query: str,
        location: Optional[str] = None,
        max_results: int = 20
    ) -> List[ScrapedJob]:
        """
        Search StepStone Germany jobs using Apify

        Args:
            query: Job keywords
            location: Location in Germany (e.g., "Berlin", "Munich")
            max_results: Maximum number of results to return

        Returns:
            List of ScrapedJob objects
        """
        run_input = {
            'searchTerms': [query],
            'location': location or '',
            'maxItems': max_results,
            'proxyConfiguration': {'useApifyProxy': True}
        }

        return await self._run_actor(
            actor_id='stepstone-germany-jobs-scraper',
            run_input=run_input,
            source_name='apify_stepstone_de'
        )

    async def _run_actor(
        self,
        actor_id: str,
        run_input: Dict,
        source_name: str,
        timeout_secs: int = 300
    ) -> List[ScrapedJob]:
        """
        Run an Apify actor and return parsed jobs

        Args:
            actor_id: The Apify actor ID
            run_input: Input parameters for the actor
            source_name: Source identifier for logging
            timeout_secs: Maximum wait time for actor completion

        Returns:
            List of ScrapedJob objects
        """
        if not self.session:
            raise RuntimeError("Client not initialized. Use async with context manager.")

        try:
            logger.info(f"[Apify] Starting actor: {actor_id}")

            # Start actor run
            start_url = f"{self.base_url}/acts/{actor_id}/runs"
            async with self.session.post(start_url, json=run_input) as response:
                if response.status not in [200, 201]:
                    error_text = await response.text()
                    logger.error(f"[Apify] Failed to start actor: {error_text}")
                    return []

                run_data = await response.json()
                run_id = run_data['data']['id']
                dataset_id = run_data['data']['defaultDatasetId']

            # Wait for completion
            logger.info(f"[Apify] Waiting for run {run_id}...")
            status = await self._wait_for_completion(run_id, timeout_secs)

            if status != 'SUCCEEDED':
                logger.error(f"[Apify] Actor run failed with status: {status}")
                return []

            # Fetch results from dataset
            dataset_url = f"{self.base_url}/datasets/{dataset_id}/items"
            async with self.session.get(dataset_url) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"[Apify] Failed to fetch results: {error_text}")
                    return []

                items = await response.json()
                jobs = self._parse_apify_results(items, source_name)
                logger.info(f"[Apify] Found {len(jobs)} jobs from {actor_id}")
                return jobs

        except Exception as e:
            logger.error(f"[Apify] Actor run failed: {e}")
            return []

    async def _wait_for_completion(
        self,
        run_id: str,
        timeout_secs: int,
        poll_interval: int = 5
    ) -> str:
        """Wait for Apify actor run to complete"""
        start_time = asyncio.get_event_loop().time()

        while True:
            async with self.session.get(
                f"{self.base_url}/actor-runs/{run_id}"
            ) as response:
                if response.status != 200:
                    return 'FAILED'

                data = await response.json()
                status = data['data']['status']

                if status in ['SUCCEEDED', 'FAILED', 'TIMED_OUT', 'ABORTED']:
                    return status

                # Check timeout
                elapsed = asyncio.get_event_loop().time() - start_time
                if elapsed > timeout_secs:
                    return 'TIMED_OUT'

                await asyncio.sleep(poll_interval)

    def _parse_apify_results(
        self,
        items: List[Dict],
        source: str
    ) -> List[ScrapedJob]:
        """Parse Apify actor results into ScrapedJob objects"""
        jobs = []

        for item in items:
            try:
                job = ScrapedJob(
                    id=item.get('id', f"{source}_{len(jobs)}"),
                    title=item.get('title', 'Unknown'),
                    company=item.get('company', item.get('advertiser', 'Unknown')),
                    location=item.get('location', 'Unknown'),
                    description=item.get('description', item.get('summary', ''))[:5000],
                    url=item.get('url', item.get('listingUrl', '')),
                    source=source,
                    salary_range=item.get('salary', item.get('salaryRange')),
                    remote_policy=self._detect_remote_from_text(
                        item.get('description', '')
                    ),
                    posted_date=self._parse_apify_date(item.get('postedDate')),
                    required_skills=item.get('skills', [])
                )
                jobs.append(job)
            except Exception as e:
                logger.warning(f"[Apify] Failed to parse job: {e}")
                continue

        return jobs

    def _detect_remote_from_text(self, text: str) -> Optional[str]:
        """Detect remote policy from job description"""
        if not text:
            return 'onsite'

        text_lower = text.lower()
        if 'hybrid' in text_lower:
            return 'hybrid'
        elif any(word in text_lower for word in ['remote', 'work from home', 'wfh']):
            return 'remote'
        return 'onsite'

    def _parse_apify_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse various date formats from Apify"""
        if not date_str:
            return None

        formats = [
            '%Y-%m-%dT%H:%M:%S.%fZ',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d',
            '%d/%m/%Y',
            '%m/%d/%Y'
        ]

        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except:
                continue

        return None


def detect_region(location: str) -> str:
    """
    Detect region from location string

    Args:
        location: Location string (e.g., "Berlin, Germany", "Remote US")

    Returns:
        Region code (US, UK, EU, AU, DE, REMOTE)
    """
    location_lower = location.lower()

    # Check for remote first
    if 'remote' in location_lower:
        return 'REMOTE'

    # Country/region detection
    country_patterns = {
        'AU': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'],
        'DE': ['germany', 'deutschland', 'berlin', 'munich', 'münchen', 'hamburg',
               'cologne', 'köln', 'frankfurt', 'stuttgart', 'düsseldorf'],
        'UK': ['uk', 'united kingdom', 'britain', 'england', 'scotland', 'wales',
               'london', 'manchester', 'birmingham', 'liverpool', 'edinburgh'],
        'US': ['usa', 'united states', 'america', 'us', 'new york', 'san francisco',
               'los angeles', 'chicago', 'boston', 'seattle', 'austin', 'remote us'],
    }

    for region, patterns in country_patterns.items():
        if any(pattern in location_lower for pattern in patterns):
            return region

    # Default to US for English-speaking locations
    return 'US'


async def search_jobs_api(
    query: str,
    location: str,
    max_results: int = 20,
    page: int = 1
) -> List[ScrapedJob]:
    """
    Search jobs using appropriate API based on region
    Tries primary provider first, falls back to secondary if needed

    Args:
        query: Job search query
        location: Location string
        max_results: Maximum results to return
        page: Page number for pagination

    Returns:
        List of ScrapedJob objects
    """
    region = detect_region(location)
    config = REGION_CONFIG.get(region, REGION_CONFIG['US'])

    jobs = []

    # Try primary provider
    if config['primary'] == 'jsearch':
        async with JSearchClient() as client:
            jsearch_params = config.get('jsearch_params', {})
            jobs = await client.search(
                query=query,
                page=page,
                num_pages=1,
                country=jsearch_params.get('country', 'us'),
                language=jsearch_params.get('language', 'en'),
                remote_only=jsearch_params.get('remote_jobs_only') == 'true'
            )
    elif config['primary'] == 'apify':
        async with ApifyClientWrapper() as client:
            if region == 'AU':
                jobs = await client.search_seek_australia(
                    query=query,
                    location=location,
                    max_results=max_results
                )
            elif region == 'DE':
                jobs = await client.search_stepstone_germany(
                    query=query,
                    location=location,
                    max_results=max_results
                )

    # Try fallback if primary returned no results
    if not jobs and config.get('fallback') == 'jsearch':
        logger.info(f"[Search] Falling back to JSearch for {region}")
        async with JSearchClient() as client:
            jsearch_params = config.get('jsearch_params', {})
            jobs = await client.search(
                query=query,
                page=page,
                num_pages=1,
                country=jsearch_params.get('country', 'us'),
                language=jsearch_params.get('language', 'en')
            )

    return jobs[:max_results]


# Convenience functions for direct API access
async def search_jsearch(
    query: str,
    page: int = 1,
    num_pages: int = 1,
    **kwargs
) -> List[ScrapedJob]:
    """Direct JSearch API call"""
    async with JSearchClient() as client:
        return await client.search(query, page, num_pages, **kwargs)


async def search_apify_seek(
    query: str,
    location: Optional[str] = None,
    max_results: int = 20
) -> List[ScrapedJob]:
    """Direct Apify SEEK Australia call"""
    async with ApifyClientWrapper() as client:
        return await client.search_seek_australia(query, location, max_results)


async def search_apify_stepstone(
    query: str,
    location: Optional[str] = None,
    max_results: int = 20
) -> List[ScrapedJob]:
    """Direct Apify StepStone Germany call"""
    async with ApifyClientWrapper() as client:
        return await client.search_stepstone_germany(query, location, max_results)
